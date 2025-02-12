export default function Message({ message, isOwnMessage }) {
  return (
    <div
      className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      {!isOwnMessage && <div class="w-0 h-0 border-l-8 border-r-8 border-l-transparent border-t-8 border-gray-600"></div>}
      <div
        className={`text-white rounded p-4 ${
          isOwnMessage ? "bg-[#3498DB] rounded-tr-none" : "bg-gray-600 rounded-tl-none"
        }`}
      >
        {!isOwnMessage && (
          <p className="text-sm font-semibold mb-1">{message.username}</p>
        )}
        <p className="break-words">{message.content}</p>
        <p
          className={`text-xs ${
            isOwnMessage ? "text-indigo-200" : "text-gray-500"
          } mt-1`}
        >
          {new Date(message.timestamp).toLocaleString()}
        </p>
      </div>
      {isOwnMessage && <div class="w-0 h-0 border-l-8 border-r-8 border-r-transparent border-t-8 border-[#3498DB]"></div>}
    </div>
  );
}
