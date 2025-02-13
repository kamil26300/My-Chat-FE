import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Message from './Message';
import Sidebar from './Sidebar';
import { initializeSocket, sendMessage } from '../../utils/websocket';

export default function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load sessions from localStorage
    const savedSessions = JSON.parse(localStorage.getItem('chatSessions')) || [];
    setSessions(savedSessions);
    
    if (savedSessions.length > 0) {
      setCurrentSession(savedSessions[0].id);
      setMessages(savedSessions[0].messages || []);
    }

    const token = localStorage.getItem('token');
    const socketInstance = initializeSocket(token);
    setSocket(socketInstance);

    socketInstance.on('message', (message) => {
      if (currentSession) {
        addMessageToSession(currentSession, message);
      }
    });

    return () => {
      socketInstance.off('message');
    };
  }, []);

  // Update messages when switching sessions
  useEffect(() => {
    if (currentSession) {
      const currentSessionData = sessions.find(session => session.id === currentSession);
      if (currentSessionData) {
        setMessages(currentSessionData.messages || []);
      }
    }
  }, [currentSession, sessions]);

  const addMessageToSession = (sessionId, message) => {
    setSessions(prev => {
      const updatedSessions = prev.map(session => {
        if (session.id === sessionId) {
          // Create a new messages array if it doesn't exist
          const updatedMessages = [...(session.messages || []), message];
          return {
            ...session,
            messages: updatedMessages,
            // Update the session name with the first message if it's the default name
            name: session.name === `Chat ${prev.length}` && updatedMessages.length === 1 
              ? message.content.substring(0, 30) 
              : session.name
          };
        }
        return session;
      });
      
      // Update localStorage
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      
      // If this is the current session, update the messages state
      if (sessionId === currentSession) {
        const currentSessionData = updatedSessions.find(s => s.id === sessionId);
        setMessages(currentSessionData.messages || []);
      }
      
      return updatedSessions;
    });
  };

  const handleNewSession = () => {
    const newSession = {
      id: Date.now(),
      name: `Chat ${sessions.length + 1}`,
      messages: [],
      timestamp: new Date().toISOString()
    };
    setSessions(prev => {
      const updatedSessions = [newSession, ...prev];
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      return updatedSessions;
    });
    setCurrentSession(newSession.id);
    setMessages([]);
  };

  const handleSelectSession = (sessionId) => {
    setCurrentSession(sessionId);
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages || []);
    }
  };

  const handleDeleteSession = (sessionId) => {
    setSessions(prev => {
      const updatedSessions = prev.filter(session => session.id !== sessionId);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      
      if (currentSession === sessionId) {
        if (updatedSessions.length > 0) {
          setCurrentSession(updatedSessions[0].id);
          setMessages(updatedSessions[0].messages || []);
        } else {
          setCurrentSession(null);
          setMessages([]);
        }
      }
      
      return updatedSessions;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && currentSession) {
      const messageData = {
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        username: user.username
      };
      
      // Add message to current session immediately (optimistic update)
      addMessageToSession(currentSession, messageData);
      
      // Send message through socket
      sendMessage(newMessage.trim());
      
      setNewMessage('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="p-4 placeholder-white text-white border-white border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
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
