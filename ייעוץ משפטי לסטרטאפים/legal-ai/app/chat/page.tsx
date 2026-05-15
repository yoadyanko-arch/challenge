"use client";

import Link from "next/link";
import { useState, useRef, useEffect, FormEvent } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "איך מקימים חברת בע\"מ בישראל?",
  "מה ההבדל בין SAFE לבין המרת חוב?",
  "מה חייב להיות בהסכם NDA?",
  "איך מגנים על IP של סטרטאפ?",
  "מה זה ESOP ואיך מחלקים אופציות לעובדים?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (data.text) {
        setMessages([...next, { role: "assistant", content: data.text }]);
      } else {
        setMessages([...next, { role: "assistant", content: "אירעה שגיאה, נסה שוב." }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "אירעה שגיאה, נסה שוב." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 bg-white">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          Legal AI ⚖️
        </Link>
        <Link href="/documents" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          מחולל מסמכים ←
        </Link>
      </nav>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="text-5xl">⚖️</div>
            <h1 className="text-2xl font-black uppercase tracking-tight">שאל כל שאלה משפטית</h1>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
              אני מתמחה בדיני סטרטאפים ישראליים — הקמת חברה, חוזים, קניין רוחני, גיוס הון ועוד.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-md">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-right bg-white border border-gray-200 hover:border-gray-400 text-gray-700 text-sm px-4 py-3 rounded-xl transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === "user"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-900 border border-gray-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-400">
              <span className="animate-pulse">מחשב תשובה...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-gray-200 px-4 py-4 flex gap-3 bg-white"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="שאל שאלה משפטית..."
          className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-black hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white font-semibold px-5 py-3 rounded-xl text-sm"
        >
          שלח
        </button>
      </form>
    </div>
  );
}
