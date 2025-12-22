import React, { useState, useRef, useEffect } from "react";
import AdminLayout from "../adminComponents/AdminLayout";
import { Send, ChevronDown, Paperclip, FileText } from "lucide-react";
import io from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const API_BASE = import.meta.env.VITE_API_BASE_URL + "/api/chat";

export default function AdminChatbox() {
  const [sessions, setSessions] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const socketRef = useRef(null);
  const sessionsRef = useRef(sessions);
  const selectedIdxRef = useRef(selectedIdx);

  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);
  useEffect(() => { selectedIdxRef.current = selectedIdx; }, [selectedIdx]);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });
    const socket = socketRef.current;

    socket.on("receiveMessage", (msg) => {
      if (!msg?.roomId) return;

      setSessions((prev) => {
        const i = prev.findIndex((s) => String(s.roomId) === String(msg.roomId));
        const copy = [...prev];

        if (i >= 0) {
          const s = { ...copy[i] };
          s.lastMessage = msg.type === "file" ? msg.fileName : msg.content || "";
          s.msg = s.lastMessage;
          s.lastUpdated = Date.now().toString();

          if (
            String(msg.roomId) ===
            String(sessionsRef.current[selectedIdxRef.current]?.roomId)
          ) {
            s.unread = 0;
            s.unreadCount = "0";
          } else {
            s.unread = Number(s.unread || 0) + 1;
            s.unreadCount = String(Number(s.unreadCount || 0) + 1);
          }
          copy[i] = s;
        } else {
          copy.unshift({
            roomId: msg.roomId,
            name: msg.clientName || "Client",
            msg: msg.type === "file" ? msg.fileName : msg.content || "",
            lastMessage: msg.content || "",
            lastUpdated: Date.now().toString(),
            status: msg.status || "Pending",
            unread: 1,
            unreadCount: "1",
          });
        }

        return copy.sort((a, b) => b.lastUpdated - a.lastUpdated);
      });

      if (
        String(msg.roomId) ===
        String(sessionsRef.current[selectedIdxRef.current]?.roomId)
      ) {
        setMessages((m) => [...m, mapIncoming(msg)]);
        scrollToBottom();
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setLoadingSessions(true);
      const res = await fetch(`${API_BASE}/sessions`);
      const data = await res.json();

      if (data.success) {
        const formatted = (data.data || []).map((s) => ({
          roomId: s.roomId,
          name: s.clientName ?? "Client",
          msg: s.lastMessage || "",
          lastMessage: s.lastMessage || "",
          lastUpdated: s.lastUpdated || Date.now().toString(),
          status: s.status || "Pending",
          unread: Number(s.unreadCount || 0),
          unreadCount: s.unreadCount || "0",
          time: formatTimeAgo(Number(s.lastUpdated || Date.now())),
        }));

        formatted.sort((a, b) => Number(b.lastUpdated) - Number(a.lastUpdated));
        setSessions(formatted);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    const s = sessions[selectedIdx];
    if (!s) {
      setMessages([]);
      return;
    }
    socketRef.current?.emit("joinRoom", s.roomId);
    loadHistory(s.roomId);
    markAsRead(selectedIdx);
  }, [selectedIdx]);

  async function loadHistory(roomId) {
    try {
      const res = await fetch(`${API_BASE}/history/${roomId}`);
      const data = await res.json();
      if (data.success) {
        setMessages((data.data || []).map((msg) => mapIncoming(msg)));
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
    }
  }

  async function sendText(roomId, content) {
    try {
      const res = await fetch(`${API_BASE}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, sender: "admin", content }),
      });
      return await res.json();
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      return null;
    }
  }

  async function uploadFile(roomId, file) {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("roomId", roomId);
      form.append("sender", "admin");

      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
      return await res.json();
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      return null;
    }
  }

  async function updateStatus(roomId, status) {
    try {
      const res = await fetch(`${API_BASE}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, status }),
      });
      return await res.json();
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      return null;
    }
  }

  function mapIncoming(msg) {
    return {
      id: msg.id ?? `${msg.roomId}-${msg.timestamp}`,
      from: msg.sender === "admin" ? "ME" : "OP",
      text: msg.type === "file" ? "" : msg.content || msg.message || "",
      attachment:
        msg.type === "file"
          ? {
              name: msg.fileName,
              url: msg.fileUrl,
              type: msg.fileName?.includes(".pdf") ? "pdf" : "image",
            }
          : null,
      time: new Date(Number(msg.timestamp || Date.now())).toLocaleString(),
    };
  }

  function formatTimeAgo(ts) {
    const diff = Date.now() - Number(ts);
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return Math.round(diff / 60000) + "m";
    if (diff < 86400000) return Math.round(diff / 3600000) + "h";
    return new Date(ts).toLocaleDateString();
  }

  function openChat(idx) {
    setSelectedIdx(idx);
    markAsRead(idx);
  }

  function markAsRead(idx) {
    setSessions((prev) => {
      const copy = [...prev];
      if (copy[idx]) {
        copy[idx].unread = 0;
        copy[idx].unreadCount = "0";
      }
      return copy;
    });
  }

  async function handleChangeStatus(opt) {
    const s = sessions[selectedIdx];
    if (!s) return;
    const res = await updateStatus(s.roomId, opt);
    if (res?.success) {
      setSessions((prev) =>
        prev.map((x, i) => (i === selectedIdx ? { ...x, status: opt } : x))
      );
      setStatusDropdown(false);
    }
  }

  const sendMessage = async () => {
    const s = sessions[selectedIdx];
    if (!s) return;
    if (!newMessage.trim() && attachments.length === 0) return;

    setSending(true);

    if (newMessage.trim()) {
      const res = await sendText(s.roomId, newMessage.trim());
      if (res?.success) {
        setMessages((m) => [
          ...m,
          { id: Date.now(), from: "ME", text: newMessage.trim(), time: "Now" },
        ]);
        socketRef.current?.emit("sendMessage", {
          roomId: s.roomId,
          sender: "admin",
          type: "text",
          content: newMessage.trim(),
        });
      }
    }

    for (const f of attachments) {
      const res = await uploadFile(s.roomId, f.raw);
      if (res?.success) {
        setMessages((m) => [...m, mapIncoming(res.msg)]);
        socketRef.current?.emit("sendMessage", {
          ...res.msg,
          sender: "admin",
          type: "file",
        });
      }
      URL.revokeObjectURL(f.url);
    }

    await loadSessions();
    setNewMessage("");
    setAttachments([]);
    setSending(false);
    scrollToBottom();
  };

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({
      name: f.name,
      type: f.type,
      raw: f,
      url: URL.createObjectURL(f),
    }));
    setAttachments(mapped);
    e.target.value = null;
  }

  function removeAttachment(i) {
    URL.revokeObjectURL(attachments[i]?.url);
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }

  const filtered =
    activeFilter === "All"
      ? sessions
      : sessions.filter((s) => s.status === activeFilter);

  const selected = sessions[selectedIdx] || {};

 
  return (
    <AdminLayout>
      <div className="px-1 mb-6 dark:text-white">
  <h1 className="text-2xl sm:text-3xl font-semibold">
    Messages
  </h1>
  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
    Communicate with Super admin, users and invigilator
  </p>
</div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
   
        <div className="lg:col-span-1 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5">

          <div className="flex gap-4 mb-4 text-sm font-medium">
            {["All", "Pending", "InProgress", "Resolved", "Closed"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveFilter(t)}
                className={`pb-1 ${
                  activeFilter === t
                    ? "text-[#4f6df5] border-b-2 border-[#4f6df5]"
                    : "text-gray-600 dark:text-gray-300 hover:text-[#4f6df5]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[68vh] overflow-y-auto p-1 custom-scroll">
            {loadingSessions ? (
              <p>Loading...</p>
            ) : filtered.length === 0 ? (
              <p>No sessions</p>
            ) : (
              filtered.map((c) => {
                const absIdx = sessions.findIndex((s) => s.roomId === c.roomId);

                return (
                  <div
                    key={c.roomId}
                    onClick={() => openChat(absIdx)}
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border shadow-sm ${
                      selectedIdx === absIdx
                        ? "border-[#4f6df5] bg-[#eef3ff] dark:bg-[#1a1f33]"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <img
                      src={`https://i.pravatar.cc/60?u=${c.roomId}`}
                      className="w-12 h-12 rounded-full shadow border"
                    />

                    <div className="flex-1">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{c.msg}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">{c.time}</p>

                      {Number(c.unread) > 0 && (
                        <span className="bg-[#4f6df5] text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs shadow">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-lg border border-gray-300 dark:border-gray-700 flex flex-col">

          <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="font-bold text-lg">{selected.name || "No chat selected"}</h2>
              <p className="text-xs text-gray-500">#{selected.roomId || "—"}</p>
            </div>

            <div className="relative">
              <button
                onClick={() => setStatusDropdown((s) => !s)}
                className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-xl"
              >
                {selected.status || "Pending"}
                <ChevronDown size={16} />
              </button>

              {statusDropdown && (
                <div className="absolute right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl mt-2 p-2 shadow-xl z-20 w-36">
                  {["Pending", "InProgress", "Resolved", "Closed"].map((st) => (
                    <p
                      key={st}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => handleChangeStatus(st)}
                    >
                      {st}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

         
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll max-h-[60vh]">

            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.from === "ME" ? (
                 
                  <div className="flex justify-end gap-3">
                    <div className="max-w-xs bg-[#4f6df5] text-white p-3 rounded-2xl shadow-lg">
                      {msg.text && <p>{msg.text}</p>}

                      {msg.attachment && (
                        <div className="mt-2">
                          {msg.attachment.type === "pdf" ? (
                            <a
                              href={msg.attachment.url}
                              target="_blank"
                              className="flex items-center gap-2 bg-white/20 p-2 rounded"
                            >
                              <FileText size={18} />
                              <span>{msg.attachment.name}</span>
                            </a>
                          ) : (
                            <img
                              src={msg.attachment.url}
                              className="rounded-lg max-h-40 border"
                            />
                          )}
                        </div>
                      )}

                      <p className="text-[10px] opacity-70 mt-1">{msg.time}</p>
                    </div>

                    <img
                      src="https://i.pravatar.cc/35"
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                ) : (
               
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-[#4f6df5]/20 text-[#4f6df5] flex items-center justify-center rounded-full font-bold">
                      OP
                    </div>

                    <div className="max-w-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl">
                      <p>{msg.text}</p>
                      <p className="text-[10px] opacity-50 mt-1">{msg.time}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

         
          <div className="p-4 border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#0e0e0e]">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl shadow border border-gray-300 dark:border-gray-700">

              <label className="cursor-pointer">
                <Paperclip size={22} />
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                />
              </label>

              {attachments.length > 0 && (
                <div className="flex gap-2 text-xs text-gray-500">
                  {attachments.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md">
                      {f.name}
                      <button onClick={() => removeAttachment(idx)} className="text-xs">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                ref={textAreaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none text-sm resize-none max-h-28 overflow-y-auto dark:text-white"
              />

              <button
                onClick={sendMessage}
                disabled={sending}
                className="bg-[#4f6df5] text-white p-3 rounded-full shadow disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 7px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #bbb; border-radius: 10px; }
        .dark .custom-scroll::-webkit-scrollbar-thumb { background: #444; }
      `}</style>
    </AdminLayout>
  );
}
