import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Message from "./Message";
import Sidebar from "./Sidebar";
import {
  initializeSocket,
  sendMessage,
  setTypingStatus,
} from "../../utils/websocket";

export default function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [socket, setSocket] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Load sessions from localStorage
    const savedSessions =
      JSON.parse(localStorage.getItem("chatSessions")) || [];
    setSessions(savedSessions);

    if (savedSessions.length > 0) {
      setCurrentSession(savedSessions[0].id);
      setMessages(savedSessions[0].messages);
    }

    const token = localStorage.getItem("token");
    const socketInstance = initializeSocket(token);
    setSocket(socketInstance);

    socketInstance.on("message", (message) => {
      addMessageToSession(message);
    });

    socketInstance.on("userTyping", ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(username);
        } else {
          newSet.delete(username);
        }
        return newSet;
      });
    });

    return () => {
      socketInstance.off("message");
      socketInstance.off("userTyping");
    };
  }, []);

  const addMessageToSession = (message) => {
    setMessages((prev) => [...prev, message]);
    setSessions((prev) => {
      const updatedSessions = prev.map((session) => {
        if (session.id === currentSession) {
          return {
            ...session,
            messages: [...session.messages, message],
          };
        }
        return session;
      });
      localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
      return updatedSessions;
    });
  };

  const handleNewSession = () => {
    const newSession = {
      id: Date.now(),
      name: `Chat ${sessions.length + 1}`,
      messages: [],
    };
    setSessions((prev) => {
      const updatedSessions = [newSession, ...prev];
      localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
      return updatedSessions;
    });
    setCurrentSession(newSession.id);
    setMessages([]);
  };

  const handleSelectSession = (sessionId) => {
    setCurrentSession(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
    }
  };

  const handleDeleteSession = (sessionId) => {
    setSessions((prev) => {
      const updatedSessions = prev.filter(
        (session) => session.id !== sessionId
      );
      localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));

      if (currentSession === sessionId) {
        if (updatedSessions.length > 0) {
          setCurrentSession(updatedSessions[0].id);
          setMessages(updatedSessions[0].messages);
        } else {
          setCurrentSession(null);
          setMessages([]);
        }
      }

      return updatedSessions;
    });
  };

  const handleTyping = () => {
    if (socket) {
      setTypingStatus(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(false);
      }, 2000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && currentSession) {
      sendMessage(newMessage.trim());
      setNewMessage("");
      setTypingStatus(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex h-screen bg-[#222222]">
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex-1 flex flex-col pt-20">
        {currentSession ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  message={message}
                  isOwnMessage={message.username === user.username}
                />
              ))}
              {typingUsers.size > 0 && (
                <div className="text-sm text-gray-500 italic">
                  {Array.from(typingUsers).join(", ")}{" "}
                  {typingUsers.size === 1 ? "is" : "are"} typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 placeholder-white text-white border-white border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  className="flex-1 rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#3498DB]"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  className="bg-[#3498DB] rounded px-4 py-2 transition-opacity cursor-pointer hover:opacity-80 focus:outline-none focus:ring-1 focus:ring-[#3498DB]"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-200">Select a chat or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
