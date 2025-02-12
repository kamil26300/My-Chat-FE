import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Message from "./Message";
import SessionList from "./SessionList";
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
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socketInstance = initializeSocket(token);
    setSocket(socketInstance);

    // Load previous messages
    fetchMessages();

    // Socket event listeners
    socketInstance.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
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

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        "http://localhost:1337/api/messages?populate=user",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setMessages(
        data.data.map((msg) => ({
          id: msg.id,
          content: msg.attributes.content,
          username: msg.attributes.user.data.attributes.username,
          timestamp: msg.attributes.timestamp,
        }))
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
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
    if (newMessage.trim() && socket) {
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
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <Message
            key={message.id}
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
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
