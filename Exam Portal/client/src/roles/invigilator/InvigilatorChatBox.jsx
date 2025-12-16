import React, { useState, useRef, useEffect } from "react";
import { Send, ChevronDown, Paperclip, FileText } from "lucide-react";
import InvigilatorLayout from "../../components/InvigilatorLayout";

export default function InvigilatorChatBox() {
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
    name: "Super Admin",
    status: "Pending",
    time: "00:45:12",
    msg: "Server is slow…",
    unread: 3,
    messages: [
      { from: "OP", text: "Server is running slow.", time: "9:10 AM" },
      { from: "ME", text: "Checking now.", time: "9:12 AM" },
      { from: "OP", text: "Please fix ASAP.", time: "9:13 AM" },
    ],
  },

  {
    name: "Exam Coordinator",
    status: "InProgress",
    time: "00:22:05",
    msg: "Need student list…",
    unread: 1,
    messages: [
      { from: "OP", text: "Send me today's student list.", time: "10:00 AM" },
      { from: "ME", text: "Preparing it.", time: "10:05 AM" },
    ],
  },

  {
    name: "Student 112",
    status: "Active",
    time: "00:18:43",
    msg: "Can't access exam…",
    unread: 2,
    messages: [
      { from: "OP", text: "I'm unable to access exam page.", time: "11:20 AM" },
      { from: "ME", text: "Try logging in again.", time: "11:22 AM" },
      { from: "OP", text: "Still same issue.", time: "11:23 AM" },
    ],
  },

  {
    name: "Teacher A",
    status: "Resolved",
    time: "01:12:30",
    msg: "Upload working now.",
    unread: 0,
    messages: [
      { from: "OP", text: "Upload is failing.", time: "1:40 PM" },
      { from: "ME", text: "Issue fixed. Try now.", time: "1:45 PM" },
      { from: "OP", text: "Working now. Thanks!", time: "1:47 PM" },
    ],
  },

  {
    name: "Parent – Suresh",
    status: "Pending",
    time: "00:05:55",
    msg: "Hall ticket issue…",
    unread: 1,
    messages: [
      { from: "OP", text: "Hall ticket not received yet.", time: "2:00 PM" },
      { from: "ME", text: "Let me check.", time: "2:02 PM" },
    ],
  },

  {
    name: "Guest User",
    status: "Closed",
    time: "01:55:33",
    msg: "General inquiry closed.",
    unread: 0,
    messages: [
      { from: "OP", text: "When is next exam?", time: "4:10 PM" },
      { from: "ME", text: "Check the schedule page.", time: "4:12 PM" },
      { from: "OP", text: "Okay. Closing ticket.", time: "4:13 PM" },
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
    <InvigilatorLayout>
      <h1 className="text-2xl font-bold mb-1 dark:text-white">Messages</h1>
      <p className="text-gray-500 dark:text-gray-300 mb-6">
        Communicate with Super admin, users and invigilator
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-lg border p-5">
          <div className="flex gap-4 mb-4 text-sm font-medium">
            {["All", "Pending", "InProgress", "Resolved", "Closed"].map((tab) => (
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
            ))}
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
        <div className="lg:col-span-2 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-lg border flex flex-col">
          
          {/* HEADER */}
          <div className="flex items-center justify-between p-5 border-b">
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                {selected.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">#CU678BH</p>
            </div>

            <div className="relative">
              <button
                onClick={() => setStatusDropdown(!statusDropdown)}
                className="flex items-center gap-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-xl shadow"
              >
                {selected.status}
                <ChevronDown size={16} />
              </button>

              {statusDropdown && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl border p-2 text-sm w-36 z-20">
                  {["Pending", "InProgress", "Resolved", "Closed"].map((opt) => (
                    <p
                      key={opt}
                      onClick={() => {
                        const updated = [...chats];
                        updated[selectedChat].status = opt;
                        setChats(updated);
                        setStatusDropdown(false);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                    >
                      {opt}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* MESSAGES (SCROLL FIX APPLIED) */}
          <div
            className="overflow-y-auto p-6 space-y-6 custom-scroll"
            style={{
              height: "60vh",      // ⭐ FIXED SCROLL HEIGHT
              scrollBehavior: "smooth",
            }}
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
                      <p className="text-gray-700 dark:text-gray-200">
                        {msg.text}
                      </p>
                      <p className="text-[10px] opacity-50 mt-1">{msg.time}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-4 border-t bg-gray-50 dark:bg-[#0e0e0e]">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl p-3 shadow border">

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
                <div className="flex gap-2 text-xs">
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
                className="flex-1 bg-transparent outline-none text-sm resize-none max-h-28 overflow-y-auto"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                rows={1}
              />

              <button
                onClick={sendMessage}
                className="bg-[#4f6df5] hover:bg-blue-600 text-white p-3 rounded-full shadow"
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
      `}</style>
    </InvigilatorLayout>
  );
}
