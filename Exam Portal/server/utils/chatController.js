const express = require("express");
const { createClient } = require("redis");
const multer = require("multer");
const db = require("../config/database");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const uploadDir = "uploads/chat_files";
const FILE_EXPIRY_MS = 2 * 60 * 60 * 1000; 
const REDIS_EXPIRY_SEC = 2 * 60 * 60;     

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created upload directory:", uploadDir);
}
setInterval(() => {
  const now = Date.now();

  fs.readdir(uploadDir, (err, files) => {
    if (err) return;

    files.forEach((file) => {
      const filePath = path.join(uploadDir, file);

      fs.stat(filePath, (err, stats) => {
        if (!err && now - stats.mtimeMs > FILE_EXPIRY_MS) {
          fs.unlink(filePath, () =>
            console.log("🗑 Deleted expired file:", file)
          );
        }
      });
    });
  });
}, 30 * 60 * 1000); 

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
redis.connect();

const STREAM_PREFIX = "chat_stream:";
const SESSION_PREFIX = "chat_session:";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Invalid file format"));
  },
});
async function getUserRole(userId) {
  const result = await db.query(
    `SELECT role FROM "mainexamportal"."asi_users" WHERE asi_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows.length ? result.rows[0].role.toLowerCase() : null;
}
function isChatAllowed(senderRole, receiverRole) {
  if (senderRole === "superadmin") return receiverRole === "admin";
  if (senderRole === "admin") return ["superadmin", "user", "invigilator"].includes(receiverRole);
  if (senderRole === "user") return receiverRole === "admin";
  if (senderRole === "invigilator") return receiverRole === "admin";
  return false;
}

async function updateChatSession(msg) {
  const sessionKey = SESSION_PREFIX + msg.roomId;

  const existingUnread = await redis.hGet(sessionKey, "unreadCount");
  const unreadCount =
    msg.target === "receiver" ? Number(existingUnread || 0) + 1 : 0;

  await redis.hSet(sessionKey, {
    roomId: msg.roomId,
    clientName: msg.clientName || "Client",
    lastMessage: msg.type === "file" ? msg.fileName : msg.content,
    lastUpdated: Date.now().toString(),
    status: msg.status || "Pending",
    unreadCount: unreadCount.toString(),
    senderRole: msg.senderRole,
    receiverRole: msg.receiverRole,
  });

  await redis.expire(sessionKey, REDIS_EXPIRY_SEC); 
}
async function addMessageToStream(msg) {
  const streamKey = STREAM_PREFIX + msg.roomId;

  await redis.xAdd(streamKey, "*", {
    sender: msg.sender,
    senderRole: msg.senderRole,
    receiver: msg.receiver,
    receiverRole: msg.receiverRole,
    roomId: msg.roomId,
    timestamp: Date.now().toString(),
    type: msg.type,
    content: msg.content || "",
    fileUrl: msg.fileUrl || "",
    fileName: msg.fileName || "",
  });

  await redis.sendCommand(["XTRIM", streamKey, "MAXLEN", "~", "200"]);
  await redis.expire(streamKey, REDIS_EXPIRY_SEC); 

  await updateChatSession(msg);
}
router.post("/message", async (req, res) => {
  try {
    const { roomId, sender, receiver, content, clientName } = req.body;

    if (!roomId || !sender || !receiver || !content)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const senderRole = await getUserRole(sender);
    const receiverRole = await getUserRole(receiver);

    if (!isChatAllowed(senderRole, receiverRole))
      return res.status(403).json({ success: false, message: "Chat not allowed" });

    const msg = {
      roomId,
      sender,
      receiver,
      senderRole,
      receiverRole,
      type: "text",
      content,
      clientName,
      target: "receiver",
    };

    await addMessageToStream(msg);
    res.json({ success: true, msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { roomId, sender, receiver, clientName } = req.body;

    const senderRole = await getUserRole(sender);
    const receiverRole = await getUserRole(receiver);

    if (!isChatAllowed(senderRole, receiverRole))
      return res.status(403).json({ success: false, message: "Chat not allowed" });

    const msg = {
      roomId,
      sender,
      receiver,
      senderRole,
      receiverRole,
      type: "file",
      fileUrl: `/uploads/chat_files/${req.file.filename}`,
      fileName: req.file.originalname,
      clientName,
      target: "receiver",
    };

    await addMessageToStream(msg);
    res.json({ success: true, msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


function initChatSocket(io) {
  io.on("connection", (socket) => {
    socket.on("joinRoom", async ({ roomId }) => {
      socket.join(roomId);
      await redis.hSet(SESSION_PREFIX + roomId, { unreadCount: "0" });
    });

    socket.on("sendMessage", async (msg) => {
      const senderRole = await getUserRole(msg.sender);
      const receiverRole = await getUserRole(msg.receiver);

      if (!isChatAllowed(senderRole, receiverRole)) return;

      msg.senderRole = senderRole;
      msg.receiverRole = receiverRole;
      msg.target = "receiver";

      await addMessageToStream(msg);
      io.to(msg.roomId).emit("receiveMessage", msg);
    });
  });
}

module.exports = { router, initChatSocket };
