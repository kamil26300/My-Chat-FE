export default function Message({ message, isOwnMessage }) {
  return (
    <div
      className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-4 ${
          isOwnMessage ? "bg-indigo-600 text-white" : "bg-white text-gray-800"
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
    </div>
  );
}
