const express = require("express");
const { createClient } = require("redis");
const multer = require("multer");
const router = express.Router();
// REDIS CLIENT
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
redis.connect();
const STREAM_PREFIX = "chat_stream:";
const SESSION_PREFIX = "chat_session:";
// MULTER FILE UPLOAD
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/chat_files/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Invalid file format"));
  },
});
// UPDATE CHAT SESSION (Sidebar list)
async function updateChatSession(msg) {
  const sessionKey = SESSION_PREFIX + msg.roomId;

  await redis.hSet(sessionKey, {
    roomId: msg.roomId,
    clientName: msg.clientName || "Client",
    lastMessage: msg.type === "file" ? msg.fileName : msg.content,
    lastUpdated: Date.now().toString(),
    status: msg.status || "Pending",
    unreadCount: msg.unreadIncrease || "0",
  });
}

// ADD MESSAGE TO REDIS STREAM
async function addMessageToStream(msg) {
  const streamKey = STREAM_PREFIX + msg.roomId;

  const payload = {
    sender: msg.sender,
    roomId: msg.roomId,
    timestamp: Date.now().toString(),
    type: msg.type || "text",
  };

  if (msg.type === "file") {
    payload.fileUrl = msg.fileUrl;
    payload.fileName = msg.fileName;
  } else {
    payload.content = msg.content;
  }

  await redis.xAdd(streamKey, "*", payload);
  await updateChatSession(msg);
}

// SEND TEXT MESSAGE
router.post("/message", async (req, res) => {
  try {
    const { roomId, sender, content, clientName } = req.body;

    if (!roomId || !sender || !content) {
      return res.status(400).json({
        success: false,
        message: "roomId, sender, content required",
      });
    }

    const msg = {
      roomId,
      sender,
      content,
      type: "text",
      clientName,
      unreadIncrease: "1",
    };

    await addMessageToStream(msg);

    return res.json({
      success: true,
      message: "Text message sent",
      msg,
    });
  } catch (err) {
    console.error("Text message error:", err);
    res.status(500).json({ success: false });
  }
});

// FILE UPLOAD + SEND AS MESSAGE
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File upload failed",
      });
    }

    const { roomId, sender, clientName } = req.body;

    if (!roomId || !sender) {
      return res.status(400).json({
        success: false,
        message: "roomId and sender required",
      });
    }

    const fileUrl = `/uploads/chat_files/${req.file.filename}`;

    const msg = {
      roomId,
      sender,
      type: "file",
      fileUrl,
      fileName: req.file.originalname,
      clientName,
      unreadIncrease: "1",
    };

    await addMessageToStream(msg);

    return res.json({
      success: true,
      message: "File uploaded + message sent",
      msg,
    });
  } catch (err) {
    console.error("File upload message error:", err);
    res.status(500).json({ success: false });
  }
});

// UPDATE STATUS (Resolved / Pending / Active)
router.patch("/status", async (req, res) => {
  const { roomId, status } = req.body;

  if (!roomId || !status) {
    return res.status(400).json({
      success: false,
      message: "roomId and status required",
    });
  }

  await redis.hSet(SESSION_PREFIX + roomId, { status });

  return res.json({ success: true, message: "Status updated" });
});

// GET ALL SESSIONS (Sidebar)
router.get("/sessions", async (req, res) => {
  const keys = await redis.keys(SESSION_PREFIX + "*");

  const sessions = [];
  for (let key of keys) {
    const data = await redis.hGetAll(key);
    sessions.push(data);
  }

  sessions.sort((a, b) => Number(b.lastUpdated) - Number(a.lastUpdated));

  return res.json({ success: true, data: sessions });
});


router.get("/history/:roomId", async (req, res) => {
  const streamKey = STREAM_PREFIX + req.params.roomId;

  const entries = await redis.xRange(streamKey, "-", "+");

  const messages = entries.map(([id, fields]) => {
    const msg = { id };
    for (let i = 0; i < fields.length; i += 2) {
      msg[fields[i]] = fields[i + 1];
    }
    return msg;
  });

  return res.json({ success: true, data: messages });
});


function parseXRange(entries) {
  const messages = [];

  for (const entry of entries) {
    // Case 1: Standard XRANGE output → [id, [field, value, field, value]]
    if (Array.isArray(entry) && Array.isArray(entry[1])) {
      const [id, fields] = entry;
      const msg = { id };
      for (let i = 0; i < fields.length; i += 2) {
        msg[fields[i]] = fields[i + 1];
      }
      messages.push(msg);
    }

    // Case 2: Redis returns object format → { id: "123", message: { ... } }
    else if (typeof entry === "object" && entry !== null) {
      const msg = { id: entry.id };

      if (entry.message && typeof entry.message === "object") {
        Object.entries(entry.message).forEach(([key, val]) => {
          msg[key] = val;
        });
      }

      messages.push(msg);
    }
  }

  return messages;
}
router.get("/receive/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId;
    let lastId = req.query.lastId || "0";

    const streamKey = STREAM_PREFIX + roomId;

    // Check if stream exists
    const exists = await redis.exists(streamKey);
    if (!exists) {
      return res.json({
        success: true,
        new: false,
        lastId,
        data: []
      });
    }

    // Determine where to start reading
    const startId = lastId === "0" ? "-" : "(" + lastId;

    // XRANGE call
    const entries = await redis.xRange(streamKey, startId, "+");

    // Handle no new entries
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.json({
        success: true,
        new: false,
        lastId,
        data: []
      });
    }

    // Convert using universal parser
    const messages = parseXRange(entries);

    const newLastId = messages[messages.length - 1].id;

    return res.json({
      success: true,
      new: true,
      lastId: newLastId,
      data: messages
    });

  } catch (err) {
    console.error("🔥 Receive message error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// SOCKET.IO REAL-TIME CHAT
function initChatSocket(io) {
  io.on("connection", (socket) => {
    console.log("🔥 User connected:", socket.id);

    socket.on("joinRoom", async (roomId) => {
      socket.join(roomId);
      await redis.hSet(SESSION_PREFIX + roomId, { unreadCount: "0" });
    });

    socket.on("sendMessage", async (msg) => {
      if (!msg.roomId) return;

      msg.unreadIncrease = "1";
      await addMessageToStream(msg);

      io.to(msg.roomId).emit("receiveMessage", msg);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
}

module.exports = {
  router,
  initChatSocket,
};
