export default function Message({ message, isOwnMessage }) {
  return (
    <div
      className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      {!isOwnMessage && <div class="mt-auto w-0 h-0 border-l-8 border-r-8 border-l-transparent border-b-8 border-gray-600 translate-x-1/2"></div>}
      <div
        className={`text-white rounded p-4 ${
          isOwnMessage ? "bg-[#3498DB] rounded-tr-none" : "bg-gray-600 rounded-tl-none"
        }`}
      >
        {message.isServerReply && (
          <p className="text-sm font-semibold mb-1">Server</p>
        )}
        <p className="break-words break-all">{message.content}</p>
        <p
          className="text-xs text-indigo-100 mt-1"
        >
          {new Date(message.timestamp).toLocaleString()}
        </p>
      </div>
      {isOwnMessage && <div class="mt-auto w-0 h-0 border-l-8 border-r-8 border-r-transparent border-b-8 border-[#3498DB] -translate-x-1/2"></div>}
    </div>
  );
}
