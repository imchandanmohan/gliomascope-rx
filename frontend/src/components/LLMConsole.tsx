import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type Message = { sender: "radiologist" | "assistant"; text: string };

export default function LLMConsole({
  inputImage,
  maskImage,
}: {
  inputImage?: string;
  maskImage?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

  const MODEL = "gemini-2.5-flash-lite";

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setErrMsg(null);

    const userMsg: Message = { sender: "radiologist", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const parts: any[] = [
        {
          text: `
You are a **radiology assistant** reviewing brain MRI segmentation.
Generate a concise but structured clinical summary with:
1. **Observed Region/Location**
2. **Tumor Characteristics**
3. **Confidence / Artifacts**
4. **Recommendation**
Then answer any question naturally. and no extra text. make it consice as much as you can even one line is ok if the question is small like example
Question:do you think this is a glioma?
Answer:mostly yes
`,
        },
      ];

      if (inputImage && inputImage.startsWith("data:image"))
        parts.push({ inline_data: { mime_type: "image/png", data: inputImage.split(",")[1] } });

      if (maskImage && maskImage.startsWith("data:image"))
        parts.push({ inline_data: { mime_type: "image/png", data: maskImage.split(",")[1] } });

      parts.push({ text: input });

      const body = { contents: [{ role: "user", parts }] };

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Gemini HTTP ${res.status}: ${t}`);
      }

      const data = await res.json();
      const reply =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p?.text)
          ?.join("\n")
          ?.trim() || "No response.";

      setMessages((prev) => [...prev, { sender: "assistant", text: reply }]);
    } catch (e: any) {
      console.error("Gemini error:", e);
      setErrMsg(e.message);
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: "_Error: Unable to process your request._" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col font-[Inter]">
      <div className="border-b border-slate-700 px-4 py-2 text-sm text-teal-400 font-semibold tracking-wide">
        🧠 Glioma Assistant
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 text-sm space-y-3 relative scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
      >
        {messages.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs select-none">
            Ask Glioma Assistant…
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === "radiologist" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-md leading-relaxed whitespace-pre-wrap ${
                m.sender === "radiologist"
                  ? "bg-slate-700 text-slate-100"
                  : "bg-teal-600/90 text-white"
              }`}
            >
              <ReactMarkdown
                components={{
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">{children}</strong>
                  ),
                  li: ({ children }) => <li className="ml-4 list-disc">{children}</li>,
                  p: ({ children }) => <p className="mb-2">{children}</p>,
                }}
              >
                {m.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-2xl bg-teal-600/70 text-white animate-pulse">
              Thinking…
            </div>
          </div>
        )}

        {errMsg && (
          <div className="text-xs text-red-400 bg-red-900/30 border border-red-700 rounded p-2 mt-2">
            {errMsg}
          </div>
        )}
      </div>

      <div className="border-t border-slate-700 p-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
          placeholder="Ask Glioma Assistant…"
          className="flex-1 bg-slate-700 text-slate-100 rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-teal-500"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white px-3 rounded-md text-sm transition"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </aside>
  );
}