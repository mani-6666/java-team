import UserLayout from "../usercomponents/UserLayout";
import { useState, useEffect, useRef } from "react";
import { Send, ChevronDown, ArrowLeft, Paperclip } from "lucide-react";

export default function Chatbox() {
  const [selectedChat, setSelectedChat] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileViewChat, setMobileViewChat] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 1024);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const [chats, setChats] = useState([
    {
      name: "Admin",
      status: "Pending",
      time: "00:31:00",
      msg: "Issue with exam.",
      unread: 2,
      messages: [
        { from: "OP", text: "Hello, how can I assist you?", time: "8:00 PM" },
        { from: "ME", text: "I am facing an issue with my exam", time: "8:01 PM" }
      ]
    },
    {
      name: "Admin",
      status: "Active",
      time: "00:12:44",
      msg: "Checking your request.",
      unread: 1,
      messages: [
        { from: "OP", text: "What issue are you facing?", time: "7:00 PM" },
        { from: "ME", text: "Exam is not opening", time: "7:05 PM" },
        { from: "OP", text: "Checking now. Please wait.", time: "7:10 PM" }
      ]
    }
  ]);

  const selected = chats[selectedChat];

  const handleFileChange = (e) => {
    const files = [...e.target.files];
    const newAtt = files.map((file) => ({
      id: Date.now() + "-" + file.name,
      name: file.name,
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    }));
    setAttachments((prev) => [...prev, ...newAtt]);
  };

  const sendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    const updated = [...chats];
    updated[selectedChat].messages.push({
      from: "ME",
      text: newMessage,
      time: "Now",
      attachments: attachments.length ? attachments : undefined
    });
    updated[selectedChat].msg = newMessage || attachments[0]?.name;
    setChats(updated);
    setNewMessage("");
    setAttachments([]);
  };

  const filteredChats =
    activeFilter === "All" ? chats : chats.filter((c) => c.status === activeFilter);

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F14] px-3 py-4">
        <h1 className="text-[26px] font-semibold text-gray-900 dark:text-white">
          Messages
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Communicate with Admin
        </p>

        <div className="w-full bg-white dark:bg-[#0F0F0F] rounded-2xl shadow border border-gray-200 dark:border-gray-800 flex h-[calc(100vh-160px)] overflow-hidden">

          {!mobileViewChat && (
            <div className="border-r border-gray-200 dark:border-gray-800 px-5 py-4 w-full max-w-[380px] flex flex-col lg:block">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Messages
              </h2>

              <div className="flex items-center gap-5 mb-5 overflow-x-auto">
                {["All", "Pending", "InProgress", "Resolved", "Closed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`text-[14px] whitespace-nowrap font-medium ${
                      activeFilter === tab
                        ? "text-[#4F6DF5] border-b-2 border-[#4F6DF5] pb-[4px]"
                        : "text-gray-500 dark:text-gray-400 hover:text-[#4F6DF5]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {filteredChats.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      const updated = [...chats];
                      updated[i] = {
                        ...updated[i],
                        unread: 0
                      };

                      setChats(updated);
                      setSelectedChat(i);
                      if (isMobile) setMobileViewChat(true);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border shadow-sm transition-all
                    ${
                      selectedChat === i
                        ? "border-[#4F6DF5] bg-[#EEF3FF] dark:bg-[#1C2333]"
                        : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#1A1F2A]"
                    }`}
                  >
                    <img src="https://i.pravatar.cc/150?img=55" className="w-12 h-12 rounded-full" />

                    <div className="flex-1">
                      <p className="font-medium text-[15px] text-gray-900 dark:text-white">{c.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{c.msg}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">{c.time}</p>
                      {c.unread > 0 && (
                        <span className="bg-[#4F6DF5] text-white w-5 h-5 rounded-full text-xs inline-flex justify-center items-center mt-1">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!isMobile || mobileViewChat) && (
            <div className="flex-1 flex flex-col dark:bg-[#0F0F0F]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button
                      onClick={() => setMobileViewChat(false)}
                      className="mr-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700"
                    >
                      <ArrowLeft size={18} className="text-gray-700 dark:text-white" />
                    </button>
                  )}

                  <img src="https://i.pravatar.cc/150?img=55" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-[16px] text-gray-900 dark:text-white">
                      {selected.name}
                    </p>
                    <p className="text-xs text-gray-500">#{selected.status}</p>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setStatusDropdown(!statusDropdown)}
                    className="flex items-center gap-2 text-sm bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-xl text-gray-800 dark:text-white"
                  >
                    {selected.status}
                    <ChevronDown size={16} />
                  </button>

                  {statusDropdown && (
                    <div className="absolute right-0 mt-2 bg-white dark:bg-[#0F0F0F] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-2 w-36">
                      {["Pending", "InProgress", "Resolved", "Closed"].map((opt) => (
                        <p
                          key={opt}
                          onClick={() => {
                            const updated = [...chats];
                            updated[selectedChat].status = opt;
                            setChats(updated);
                            setStatusDropdown(false);
                          }}
                          className="p-2 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#1A1F2A] rounded-lg cursor-pointer"
                        >
                          {opt}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {selected.messages.map((msg, i) =>
                  msg.from === "ME" ? (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-sm bg-[#4F6DF5] text-white px-4 py-3 rounded-2xl shadow">
                        <p>{msg.text}</p>
                        <p className="text-[10px] opacity-70 mt-1 text-right">{msg.time}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex gap-3">
                      <div className="w-9 h-9 bg-[#4F6DF5]/20 text-[#4F6DF5] rounded-full flex justify-center items-center">
                        OP
                      </div>

                      <div className="max-w-sm bg-gray-100 dark:bg-[#151A22] border border-[#4F6DF5] text-gray-800 dark:text-gray-200 px-4 py-3 rounded-2xl shadow">
                        <p>{msg.text}</p>
                        <p className="text-[10px] opacity-60 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800">
                <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />

                <div className="flex items-center gap-3 bg-gray-100 dark:bg-[#151A22] rounded-xl px-3 py-3 border border-gray-300 dark:border-gray-700">
                  <input
                    className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write a message…"
                  />

                  <button onClick={() => fileInputRef.current.click()}>
                    <Paperclip size={18} className="text-gray-500 dark:text-gray-300" />
                  </button>

                  <button
                    onClick={sendMessage}
                    className="bg-[#4F6DF5] hover:bg-blue-600 text-white p-2 rounded-full"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
