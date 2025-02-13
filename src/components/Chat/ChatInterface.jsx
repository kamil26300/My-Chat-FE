import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Message from "./Message";
import Sidebar from "./Sidebar";
import { initializeSocket } from "../../utils/websocket";
import toast from "react-hot-toast";

export default function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUserSessions = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_BACKEND_API_URL +
            `/api/sessions?userId=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setSessions(data.data || []);

        if (data.data.length > 0) {
          setCurrentSession(data.data[0].sessionId);
          fetchSessionMessages(data.data[0].sessionId);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    // Clean up previous socket instance if it exists
    if (socket) {
      socket.off("message");
      socket.disconnect();
    }

    const token = localStorage.getItem("token");
    const socketInstance = initializeSocket(token);
    setSocket(socketInstance);

    socketInstance.on("message", (message) => {
      if (currentSession && message.sessionId === currentSession) {
        setMessages((prev) => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(
            (m) =>
              m.timestamp === message.timestamp &&
              m.content === message.content &&
              m.userId === message.userId
          );
          if (!messageExists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    fetchUserSessions();

    return () => {
      if (socketInstance) {
        socketInstance.off("message");
        socketInstance.disconnect();
      }
    };
  }, [user.id]);

  const fetchSessionMessages = async (sessionId) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_API_URL +
          `/api/messages/session?sessionId=${sessionId}&userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleNewSession = async () => {
    try {
      const sessionId = Date.now().toString();
      const response = await fetch(
        import.meta.env.VITE_BACKEND_API_URL + "/api/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            data: {
              name: `Chat ${sessions.length + 1}`,
              userId: user.id,
              sessionId: sessionId,
              timestamp: new Date().toISOString(),
            },
          }),
        }
      );

      const newSession = await response.json();
      setSessions((prev) => [newSession.data, ...prev]);
      setCurrentSession(sessionId);
      setMessages([]);
      toast("New chat session created");
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleSelectSession = (sessionId) => {
    setCurrentSession(sessionId);
    fetchSessionMessages(sessionId);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      // Delete session
      const sessionResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!sessionResponse.ok) {
        throw new Error("Failed to delete session");
      }

      // Delete all messages associated with this session
      const messagesResponse = await fetch(
        `${
          import.meta.env.VITE_BACKEND_API_URL
        }/api/messages/session/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!messagesResponse.ok) {
        throw new Error("Failed to delete session messages");
      }

      setSessions((prev) => {
        const updatedSessions = prev.filter(
          (session) => session.sessionId !== sessionId
        );

        if (currentSession === sessionId) {
          if (updatedSessions.length > 0) {
            setCurrentSession(updatedSessions[0].sessionId);
            fetchSessionMessages(updatedSessions[0].sessionId);
          } else {
            setCurrentSession(null);
            setMessages([]);
          }
        }

        toast.success("Chat session deleted successfully");
        return updatedSessions;
      });
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete chat session");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && currentSession) {
      const messageData = {
        content: newMessage.trim(),
        sessionId: currentSession,
        userId: user.id,
        timestamp: new Date().toISOString(),
        isServerReply: false,
      };

      // Send message through socket first
      socket.emit("sendMessage", messageData);

      // Clear input immediately
      setNewMessage("");
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
                  isOwnMessage={!message.isServerReply}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-4 placeholder-white text-white border-white border-t"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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
