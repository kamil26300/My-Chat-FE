import { PlusIcon } from "@heroicons/react/24/solid";

export default function Sidebar({
  sessions,
  currentSession,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}) {
  return (
    <div className="w-64 bg-[#333333] h-screen flex flex-col pt-20 overflow-auto shadow-2xl">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewSession}
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
                    onDeleteSession(session.id);
                  }}
                  className="text-gray-400 hover:text-[#E74C3C] cursor-pointer ml-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
