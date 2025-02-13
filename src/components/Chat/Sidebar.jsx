import { useState } from "react";
import Modal from "react-modal";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

export default function Sidebar({
  sessions,
  currentSession,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const openModal = (sessionId) => {
    setSessionToDelete(sessionId);
    setIsModalOpen(true);
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

  return (
    <>
      <div className="w-64 bg-[#333333] h-screen flex flex-col pt-20 overflow-auto shadow-2xl">
        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={(e) => {
              toast("New chat session created");
              onNewSession();
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
              onClick={() => onSelectSession(session.id)}
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
      </div>

      {/* Delete Confirmation Modal */}
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
