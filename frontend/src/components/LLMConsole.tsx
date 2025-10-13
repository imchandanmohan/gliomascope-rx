import { useState, useRef, useEffect } from "react";

type Message = { sender: "radiologist" | "assistant"; text: string };

export default function LLMConsole() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { sender: "radiologist", text: input };
    const aiMsg: Message = {
      sender: "assistant",
      text: "Assistant: Mock analysis summary… (streaming placeholder)",
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  return (
    <aside className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
      <div className="border-b border-slate-700 px-4 py-2 text-sm text-teal-400 font-medium">
        Glioma Assistant 🤖
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 text-sm space-y-3 relative">
        {messages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs select-none">
            Ask your queries…
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === "radiologist" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] px-3 py-2 rounded-lg ${
                m.sender === "radiologist" ? "bg-slate-700 text-slate-100" : "bg-teal-600 text-white"
              }`}
            >
              {m.sender === "radiologist" ? "Radiologist: " : "Glioma Assistant: "}
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-700 p-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask Glioma Assistant…"
          className="flex-1 bg-slate-700 text-slate-100 rounded-md px-2 py-1 text-sm outline-none"
        />
        <button onClick={sendMessage} className="bg-teal-600 hover:bg-teal-500 text-white px-3 rounded-md text-sm">
          Send
        </button>
      </div>
    </aside>
  );
}