import { useState } from "react";

export default function AIConsole() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, "🧠 You: " + input, "🤖 AI: " + "Mock response about tumor features."]);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col bg-slate-800">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.map((m, i) => (
          <div key={i} className="whitespace-pre-wrap text-slate-300">{m}</div>
        ))}
      </div>
      <div className="border-t border-slate-700 p-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask AI assistant..."
          className="flex-1 bg-slate-700 text-slate-100 rounded-md px-2 py-1 text-sm outline-none"
        />
        <button onClick={send} className="bg-teal-600 hover:bg-teal-500 text-white px-3 rounded-md text-sm">
          Send
        </button>
      </div>
    </div>
  );
}