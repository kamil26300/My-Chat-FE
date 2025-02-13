import {
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "react-modal";

export default function Sidebar({
  sessions,
  currentSession,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // Close mobile menu when screen size becomes larger than md
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when a session is selected
  const handleSessionSelect = (sessionId) => {
    onSelectSession(sessionId);
    setIsMobileMenuOpen(false);
  };

  const openModal = (sessionId) => {
    setSessionToDelete(sessionId);
    setIsModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSessionToDelete(null);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete);
      toast.success("Chat session deleted successfully");
    }
    closeModal();
  };

  const sidebarContent = (
    <>
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={() => {
            toast("New chat session created");
            onNewSession();
            setIsMobileMenuOpen(false);
          }}
          className="w-full flex items-center justify-center space-x-2 rounded bg-[#3498DB] text-white px-4 py-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => handleSessionSelect(session.id)}
            className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors ${
              currentSession === session.id ? "bg-gray-700" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="text-gray-300 truncate flex-1">
                <h3 className="font-medium">{session.name}</h3>
                <p className="text-sm text-gray-400 truncate">
                  {session.messages[session.messages.length - 1]?.content ||
                    "No messages"}
                </p>
              </div>
              {currentSession === session.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(session.id);
                  }}
                  className="text-gray-400 hover:text-[#E74C3C] transition-colors duration-300 cursor-pointer ml-2"
                >
                  <TrashIcon className="w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-[#333333] outline-1 text-white hover:opacity-80"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out bg-[#333333] h-screen flex-col overflow-auto shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col pt-16">{sidebarContent}</div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-[#333333] h-screen flex-col pt-20 overflow-auto shadow-2xl">
        {sidebarContent}
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="bg-[#333333] p-6 rounded-lg shadow-2xl max-w-sm mx-auto text-white"
        overlayClassName="fixed inset-0 bg-black/30 flex justify-center items-center"
      >
        <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
        <p className="mb-4">This will permanently delete the chat session.</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded hover:underline cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="bg-[#E74C3C] text-white px-4 py-2 rounded hover:opacity-80 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
}
