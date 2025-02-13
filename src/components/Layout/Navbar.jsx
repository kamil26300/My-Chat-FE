import { useState } from "react";
import Modal from "react-modal";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    closeModal();
  };

  return (
    <>
      <nav className="bg-[#333333] text-white fixed w-full z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className={`flex-shrink-0 flex items-center gap-2 justify-center ${user && "ml-12"}`}>
              <img src={logo} className="h-9 w-9" alt="Logo" />
              <h1 className="text-xl font-bold">Chat App</h1>
            </div>
            {user ? (
              <div className="flex items-center">
                <span className="text-gray-300 mr-4">{user.username}</span>
                <button
                  onClick={openModal}
                  className="bg-[#E74C3C] text-white px-4 py-2 rounded hover:opacity-80 flex items-center gap-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isModalOpen}
                >
                  <ArrowUturnLeftIcon className="h-5 w-5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4 justify-center flex items-center">
                <Link
                  to="/login"
                  className="bg-transparent border border-white text-white hover:underline font-bold py-2 px-4 transition duration-300 rounded"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#3498DB] hover:opacity-80 text-white font-bold py-2 px-4 rounded"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="bg-[#333333] p-6 rounded-lg shadow-2xl max-w-sm mx-auto text-white"
        overlayClassName="fixed inset-0 bg-black/30 flex justify-center items-center"
      >
        <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
        <div className="flex justify-end gap-4">
          <button
            onClick={closeModal}
            className="cursor-pointer px-4 py-2 rounded hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="bg-[#E74C3C] text-white px-4 py-2 rounded hover:opacity-80 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </Modal>
    </>
  );
}
