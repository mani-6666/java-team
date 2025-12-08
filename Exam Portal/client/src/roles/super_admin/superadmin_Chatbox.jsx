import React, { useState } from "react";
import { Send, MoreHorizontal, ChevronDown, Paperclip } from "lucide-react";

export default function MessagesPage() {
  const tabs = ["All", "Pending", "InProgress", "Resolved", "Closed"];
  const [activeTab, setActiveTab] = useState("All");

  const [chats, setChats] = useState([
    { id: 1, name: "Support Admin", status: "Pending", time: "00:31:00", note: "Lorem ipsum dolor sit amet" },
    { id: 2, name: "John Carter", status: "InProgress", time: "00:31:00", note: "Short note" },
    { id: 3, name: "Customer User", status: "Resolved", time: "00:31:00", note: "Important update needed" },
    { id: 4, name: "Support Admin", status: "Closed", time: "00:31:00", note: "Final conversation" },
  ]);

  const [activeChat, setActiveChat] = useState(0);

  const messagesTemplate = [
    { id: 1, sender: "me", text: "Hello Admin!", time: "8:00 PM" },
    { id: 2, sender: "admin", text: "Hi, how can I help?", time: "8:01 PM" },
  ];
  const [messages, setMessages] = useState(messagesTemplate);

  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);

  const filteredChats = chats.filter(
    (chat) => activeTab === "All" || chat.status === activeTab
  );

  const sendMessage = () => {
    if (!newMessage.trim() && !file) return;

    const newMsg = {
      id: messages.length + 1,
      sender: "me",
      text: newMessage,
      file: file ? URL.createObjectURL(file) : null,
      filename: file ? file.name : null,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
    setFile(null);
  };

  const changeStatus = (newStatus) => {
    const updated = [...chats];
    const index = updated.findIndex((c) => c.id === filteredChats[activeChat].id);
    updated[index].status = newStatus;
    setChats(updated);
    setActiveTab(newStatus);
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50 dark:bg-[#181a1e] text-[#1a1f36] dark:text-[#e6e6e6]">
      <h1 className="text-3xl font-semibold">Messages</h1>
      <p className="text-gray-500 dark:text-[#9da3ae] -mt-1 mb-5">
        Communicate with client administrators
      </p>

      <div className="bg-white dark:bg-[#1f2125] rounded-xl shadow-sm flex h-[82vh] overflow-hidden border border-[#e5e7eb] dark:border-[#2a2c31]">

     
        <aside className="w-80 md:w-96 min-w-[260px] border-r border-[#e5e7eb] dark:border-[#2a2c31] p-4 flex flex-col">

          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setActiveChat(0); }}
                  className={`px-3 py-1 rounded-full text-[13px] font-medium transition 
                  ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-600 dark:text-[#c7c7c7] hover:bg-gray-100 dark:hover:bg-[#2a2c31]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

  
          <div className="overflow-y-auto mt-2 space-y-3 pr-2">
            {filteredChats.length === 0 && (
              <p className="text-gray-400 dark:text-[#9da3ae] text-center mt-10">No chats found</p>
            )}

            {filteredChats.map((chat, index) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(index)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition
                ${
                  activeChat === index
                    ? "bg-blue-50 dark:bg-[#272a35]"
                    : "hover:bg-gray-100 dark:hover:bg-[#272a35]"
                }`}
              >
                <img
                  src={`https://i.pravatar.cc/50?img=${chat.id + 10}`}
                  alt="avatar"
                  className="w-12 h-12 rounded-full border border-[#d8d8d8] dark:border-[#333]"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm truncate">{chat.name}</p>
                    <p className="text-gray-400 dark:text-[#9da3ae] text-xs">{chat.time}</p>
                  </div>
                  <p className="text-gray-500 dark:text-[#9da3ae] text-xs truncate">{chat.note}</p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    chat.status === "Pending"
                      ? "bg-yellow-100 dark:bg-[#3b2f12] text-yellow-700 dark:text-yellow-300"
                      : chat.status === "InProgress"
                      ? "bg-blue-100 dark:bg-[#1c2b4a] text-blue-600 dark:text-blue-300"
                      : chat.status === "Resolved"
                      ? "bg-green-100 dark:bg-[#14341c] text-green-700 dark:text-green-300"
                      : "bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {chat.status}
                </span>
              </div>
            ))}

            <div className="h-4" />
          </div>
        </aside>

    
        <main className="flex-1 flex flex-col overflow-hidden">

   
          <header className="flex justify-between items-center border-b border-[#e5e7eb] dark:border-[#2a2c31] p-4 bg-white dark:bg-[#1f2125]">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/52" className="w-12 h-12 rounded-full" />
              <div>
                <p className="text-lg font-semibold">{filteredChats[activeChat]?.name}</p>
                <p className="text-gray-400 dark:text-[#9da3ae] text-sm">ID: #CU6798H</p>
              </div>
            </div>

  
            <div className="relative">
              <details className="group">
                <summary className="flex items-center gap-2 bg-blue-50 dark:bg-[#272a35] px-3 py-2 rounded-lg cursor-pointer list-none">
                  <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
                    {filteredChats[activeChat]?.status}
                  </span>
                  <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                </summary>

                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#1f2125] shadow-lg border border-[#e5e7eb] dark:border-[#333] rounded-lg p-1 z-50">
                  {tabs.slice(1).map((status) => (
                    <button
                      key={status}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#2a2c31] text-sm"
                      onClick={() => changeStatus(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </header>

 
          <section className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-[#1f2125]">
            {messages.map((msg) => {
              const isMe = msg.sender === "me";

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 ${isMe ? "justify-end" : ""}`}
                >
                  {!isMe && (
                    <img
                      src="https://i.pravatar.cc/48?img=8"
                      className="w-9 h-9 rounded-full"
                    />
                  )}

                  <div
                    className={`max-w-[70%] p-3 rounded-xl text-sm break-words ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white dark:bg-[#272a35] border border-[#e5e7eb] dark:border-[#333] text-gray-700 dark:text-[#d1d1d1] rounded-bl-none"
                    }`}
                  >
                    {msg.text}

                    {msg.file && (
                      <div className="mt-3">
                        {msg.filename.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img src={msg.file} className="max-h-48 rounded-md" />
                        ) : (
                          <a href={msg.file} download className="text-blue-300 underline">
                            {msg.filename}
                          </a>
                        )}
                      </div>
                    )}

                    <div className="text-xs opacity-70 mt-2 text-right">{msg.time}</div>
                  </div>

                  {isMe && (
                    <div className="w-9 h-9 bg-blue-100 dark:bg-[#1c2b4a] text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-bold">
                      OP
                    </div>
                  )}
                </div>
              );
            })}
          </section>

      
          <footer className="border-t border-[#e5e7eb] dark:border-[#2a2c31] p-4 bg-white dark:bg-[#1f2125]">
            <div className="flex items-center w-full border border-blue-400 dark:border-blue-500 rounded-xl px-4 py-2 gap-3 bg-white dark:bg-[#1f2125]">

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write message"
                className="flex-1 bg-transparent outline-none text-gray-700 dark:text-[#e6e6e6] placeholder-gray-400 dark:placeholder-[#8a8a8a]"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

      
              <button
                onClick={sendMessage}
                className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <Send className="w-5 h-5 text-white" />
              </button>

    
              <label className="cursor-pointer w-10 h-10 flex items-center justify-center text-blue-500 dark:text-blue-300">
                <Paperclip className="w-5 h-5" />
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
