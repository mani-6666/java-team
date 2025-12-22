const express = require("express");
const { createClient } = require("redis");
const jwt = require("jsonwebtoken");
const pool = require("../dbconfig/db.js");
const { Server } = require("socket.io");

const router = express.Router();


const redisPublisher = createClient({
  url: process.env.REDIS_URL
});

const redisSubscriber = createClient({
  url: process.env.REDIS_URL
});

(async () => {
  try {
    await redisPublisher.connect();
    await redisSubscriber.connect();
    console.log("Redis connected (publisher & subscriber)");
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();
let io;


function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const role = decoded.role?.toLowerCase();
      if (!role) return next(new Error("Role not found in token"));

      socket.role = role;
      socket.join(`role:${role}`);

      console.log(`Socket authenticated → role:${role}`);

      next();
    } catch (err) {
      console.error(" Socket auth error:", err.message);
      next(new Error("Authentication failed"));
    }
  });
  io.on("connection", (socket) => {
    console.log(` Socket connected → ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`Socket disconnected → role:${socket.role}`);
    });
  });

 
  redisSubscriber.pSubscribe("notifications:*", (message, channel) => {
    try {
      const role = channel.split(":")[1];
      const payload = JSON.parse(message);

      console.log(`Broadcasting to role:${role}`);

      io.to(`role:${role}`).emit("notification", payload);
    } catch (err) {
      console.error(" Redis broadcast error:", err.message);
    }
  });
}

router.post("/notify/template/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const query = `
      SELECT role, title, message_template
      FROM mainexamportal.notification_templates
      WHERE template_id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Template not found" });
    }

    const template = result.rows[0];
    const preparedMessage = template.message_template.replace(
      /\{(.*?)\}/g,
      (_, key) => data[key] || ""
    );

    const notificationPayload = {
      title: template.title,
      desc: preparedMessage,
      time: new Date().toISOString(),
      read: false
    };

    const roleKey = template.role.toLowerCase().replace(/\s+/g, "");

    // Publish to Redis
    await redisPublisher.publish(
      `notifications:${roleKey}`,
      JSON.stringify(notificationPayload)
    );

    return res.json({
      success: true,
      delivered_to_role: roleKey,
      notification: notificationPayload
    });

  } catch (err) {
    console.error(" Notification API error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { router, initSocket };