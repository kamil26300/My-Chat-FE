export default function SessionList({
  sessions,
  currentSession,
  onSelectSession,
  onNewSession,
}) {
  return (
    <div className="w-64 bg-white border-r">
      <div className="p-4">
        <button
          onClick={onNewSession}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          New Chat
        </button>
      </div>
      <div className="overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${
              currentSession === session.id ? "bg-gray-100" : ""
            }`}
          >
            <h3 className="font-medium">{session.name}</h3>
            <p className="text-sm text-gray-500">
              {session.messages.length} messages
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
