import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-[#333333] text-white fixed w-full z-10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-2 justify-center">
            <img src={logo} className="h-9 w-9" alt="" />
            <h1 className="text-xl font-bold">Chat App</h1>
          </div>
          {user && (
            <div className="flex items-center">
              <span className="text-gray-300 mr-4">Hello, {user.username}</span>
              <button
                onClick={logout}
                className="bg-[#E74C3C] text-white px-4 py-2 rounded hover:opacity-80 flex items-center gap-1 cursor-pointer"
              >
                <ArrowUturnLeftIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
