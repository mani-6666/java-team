import React, { useState, useRef, useEffect } from "react";
import AdminLayout from "../adminComponents/AdminLayout";
import {
  Send,
  ChevronDown,
  Paperclip,
  FileText,
} from "lucide-react";

export default function AdminChatbox() {
  const [selectedChat, setSelectedChat] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [statusDropdown, setStatusDropdown] = useState(false);

  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [newMessage, attachments]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "40px";
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
    }
  }, [newMessage]);

const [chats, setChats] = useState([
  {
    name: "Support Admin",
    status: "Pending",
    time: "00:31:00",
    msg: "Issue with dashboard…",
    unread: 2,
    messages: [
      { from: "OP", text: "Hi! How can I help you?", time: "8:00 PM" },
      { from: "ME", text: "Issue with dashboard", time: "8:01 PM" },
      { from: "OP", text: "Dashboard keeps loading and not opening.", time: "8:03 PM" },
      { from: "ME", text: "Checking the issue, please wait.", time: "8:05 PM" }
    ],
  },

  {
    name: "Support Staff",
    status: "Active",
    time: "00:12:44",
    msg: "Yes? Tell me…",
    unread: 0,
    messages: [
      { from: "OP", text: "Hello Admin!", time: "7:00 PM" },
      { from: "ME", text: "Yes? Tell me", time: "7:05 PM" },
      { from: "OP", text: "Need confirmation for new exam slot.", time: "7:07 PM" },
      { from: "ME", text: "Approved. You can proceed.", time: "7:10 PM" },
    ],
  },

  {
    name: "Invigilator",
    status: "Resolved",
    time: "01:01:10",
    msg: "Chat resolved!",
    unread: 1,
    messages: [
      { from: "OP", text: "Chat resolved!", time: "6:30 PM" },
      { from: "ME", text: "Glad it was sorted.", time: "6:35 PM" },
    ],
  },

  {
    name: "Teacher A",
    status: "InProgress",
    time: "00:22:15",
    msg: "Help needed with exam upload…",
    unread: 3,
    messages: [
      { from: "OP", text: "How do I upload exam papers?", time: "4:20 PM" },
      { from: "ME", text: "Go to Exam Panel → Add New Exam.", time: "4:25 PM" },
      { from: "OP", text: "It shows file size error.", time: "4:27 PM" },
      { from: "ME", text: "Compress the PDF to under 20MB.", time: "4:30 PM" },
    ],
  },

  {
    name: "Student 101",
    status: "Pending",
    time: "00:15:33",
    msg: "Can't log in…",
    unread: 2,
    messages: [
      { from: "OP", text: "I can't log in to the portal.", time: "3:10 PM" },
      { from: "ME", text: "Try resetting your password.", time: "3:12 PM" },
      { from: "OP", text: "Still not working!", time: "3:14 PM" },
    ],
  },

  {
    name: "Exam Coordinator",
    status: "Closed",
    time: "02:05:11",
    msg: "Issue solved successfully.",
    unread: 0,
    messages: [
      { from: "OP", text: "Issue solved successfully.", time: "1:10 PM" },
      { from: "ME", text: "Great! Closing the ticket.", time: "1:15 PM" },
    ],
  },

  {
    name: "Student 238",
    status: "Pending",
    time: "00:45:02",
    msg: "Result not shown…",
    unread: 4,
    messages: [
      { from: "OP", text: "My result is not showing!", time: "11:20 AM" },
      { from: "OP", text: "It's been 2 days!", time: "11:22 AM" },
    ],
  },

  {
    name: "Parent – Rahul",
    status: "Active",
    time: "00:10:20",
    msg: "Query about hall ticket…",
    unread: 0,
    messages: [
      { from: "OP", text: "Hall ticket not received.", time: "10:05 AM" },
      { from: "ME", text: "Sent to your email now.", time: "10:10 AM" },
      { from: "OP", text: "Got it. Thank you!", time: "10:12 AM" },
    ],
  },

  {
    name: "Guest User",
    status: "Resolved",
    time: "00:55:18",
    msg: "General query…",
    unread: 0,
    messages: [
      { from: "OP", text: "When will the exam start?", time: "9:45 AM" },
      { from: "ME", text: "Please check the exam schedule page.", time: "9:50 AM" },
    ],
  },

  {
    name: "Super Admin",
    status: "InProgress",
    time: "01:15:35",
    msg: "Need analytics summary…",
    unread: 2,
    messages: [
      { from: "OP", text: "Share analytics summary.", time: "8:45 AM" },
      { from: "ME", text: "Preparing it now.", time: "8:50 AM" },
      { from: "OP", text: "Need before 10 AM.", time: "8:55 AM" },
    ],
  },
]);

  const selected = chats[selectedChat];

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    const mapped = files.map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    setAttachments(mapped);

    e.target.value = null;
  };

  const sendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    const updated = [...chats];

    if (newMessage.trim()) {
      updated[selectedChat].messages.push({
        from: "ME",
        text: newMessage,
        time: "Now",
      });
    }

    attachments.forEach((file) => {
      updated[selectedChat].messages.push({
        from: "ME",
        attachment: file,
        time: "Now",
      });
    });

    updated[selectedChat].msg = newMessage || attachments[0]?.name;

    setChats(updated);
    setNewMessage("");
    setAttachments([]);
    scrollToBottom();
  };

  const openChat = (index) => {
    const updated = [...chats];
    updated[index].unread = 0;
    setChats(updated);
    setSelectedChat(index);
  };

  const filteredChats =
    activeFilter === "All"
      ? chats
      : chats.filter((c) => c.status === activeFilter);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-1 dark:text-white">Messages</h1>
      <p className="text-gray-500 dark:text-gray-300 mb-6">
        Communicate with Super admin, users and invigilator
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex gap-4 mb-4 text-sm font-medium">
            {["All", "Pending", "InProgress", "Resolved", "Closed"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`pb-1 transition-all ${
                    activeFilter === tab
                      ? "text-[#4f6df5] border-b-2 border-[#4f6df5]"
                      : "text-gray-600 dark:text-gray-300 hover:text-[#4f6df5]"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="space-y-3 max-h-[68vh] overflow-y-auto p-1 custom-scroll">
            {filteredChats.map((c, i) => {
              const idx = chats.indexOf(c);
              return (
                <div
                  key={idx}
                  onClick={() => openChat(idx)}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md border ${
                    selectedChat === idx
                      ? "border-[#4f6df5] bg-[#eef3ff] dark:bg-[#1a1f33]"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <img
                    src="https://i.pravatar.cc/60"
                    className="w-12 h-12 rounded-full shadow border"
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {c.msg}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {c.time}
                    </p>

                    {c.unread > 0 && (
                      <span className="bg-[#4f6df5] text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs shadow-md mt-1">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                {selected.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">#CU678BH</p>
            </div>

            <div className="relative">
              <button
                onClick={() => setStatusDropdown(!statusDropdown)}
                className="flex items-center gap-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-xl shadow hover:scale-105 transition"
              >
                {selected.status}
                <ChevronDown size={16} />
              </button>

              {statusDropdown && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 p-2 text-sm w-36 z-20">
                  {["Pending", "InProgress", "Resolved", "Closed"].map((opt) => (
                    <p
                      key={opt}
                      onClick={() => {
                        const updated = [...chats];
                        updated[selectedChat].status = opt;
                        setChats(updated);
                        setStatusDropdown(false);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition text-gray-700 dark:text-gray-200"
                    >
                      {opt}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MESSAGES */}
          <div
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll max-h-[60vh]"
            style={{ scrollBehavior: "smooth" }}
          >
            {selected.messages.map((msg, idx) => (
              <div key={idx}>
                {msg.from === "ME" ? (
                  <div className="flex justify-end gap-3">
                    <div className="max-w-xs bg-[#4f6df5] text-white p-3 rounded-2xl shadow-lg">
                      {msg.text && <p>{msg.text}</p>}

                      {msg.attachment && (
                        <div className="mt-2">
                          {msg.attachment.type.includes("pdf") ? (
                            <a
                              href={msg.attachment.url}
                              target="_blank"
                              className="flex items-center gap-2 bg-white/20 p-2 rounded-lg"
                            >
                              <FileText size={18} />
                              <span className="text-sm">{msg.attachment.name}</span>
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
                      className="w-8 h-8 rounded-full shadow"
                    />
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-[#4f6df5]/20 text-[#4f6df5] font-bold rounded-full flex items-center justify-center shadow">
                      OP
                    </div>

                    <div className="max-w-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl shadow">
                      <p className="text-gray-700 dark:text-gray-200">{msg.text}</p>
                      <p className="text-[10px] opacity-50 mt-1">{msg.time}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0e0e0e]">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl p-3 shadow border border-gray-300 dark:border-gray-700">

              <label className="cursor-pointer">
                <Paperclip
                  size={22}
                  className="text-gray-500 dark:text-gray-300 hover:text-[#4f6df5]"
                />
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>

              {attachments.length > 0 && (
                <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-300">
                  {attachments.map((file, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md"
                    >
                      {file.name}
                    </span>
                  ))}
                </div>
              )}

              <textarea
                ref={textAreaRef}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-white resize-none max-h-28 overflow-y-auto"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                rows={1}
              />

              <button
                onClick={sendMessage}
                className="bg-[#4f6df5] hover:bg-blue-600 text-white p-3 rounded-full shadow transition"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 7px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #c5c5c5;
          border-radius: 10px;
        }
        .dark .custom-scroll::-webkit-scrollbar-thumb {
          background: #444;
        }
      `}</style>
    </AdminLayout>
  );
}
