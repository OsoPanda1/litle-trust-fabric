import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { isabellaChat, ISABELLA_VILLASENOR, isabellaFullStatus } from "~/lib/ai/isabella";
import type { ChatMessage } from "~/lib/ai/isabella";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "Isabella Villaseñor — Sistema Operativo Cognitivo Soberano" },
      { name: "description", content: "Asistente constitucional del ecosistema TAMV y LITLE Trust Fabric. Sistema operativo cognitivo soberano con 5 capas: SOUL, Isa API, Mexa API, ClawHub, Multimodal." },
    ],
  }),
  component: AIChatPage,
});

function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: ISABELLA_VILLASENOR.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"es" | "en">("es");
  const [showStatus, setShowStatus] = useState(false);
  const [status, setStatus] = useState<ReturnType<typeof isabellaFullStatus> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    try {
      setStatus(isabellaFullStatus());
    } catch {
      // Status may not be available in all environments
    }
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    const result = await isabellaChat({ data: { messages: updated, language: lang } });

    if (result.success && result.reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply! }]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${result.error ?? "No se pudo conectar con Isabella."}`,
        },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[color:oklch(0.07_0.02_250)] text-[color:oklch(0.85_0.01_250)] font-mono">
      {/* Header */}
      <header className="border-b border-[color:oklch(0.2_0.05_200)] bg-[color:oklch(0.09_0.03_250)] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[color:oklch(0.8_0.15_190)] tracking-wider">
              ISABELLA VILLASEÑOR
            </h1>
            <p className="text-xs text-[color:oklch(0.6_0.05_200)] mt-0.5">
              {ISABELLA_VILLASENOR.title}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStatus(!showStatus)}
              className="px-3 py-1 text-xs border border-[color:oklch(0.3_0.05_200)] rounded hover:bg-[color:oklch(0.15_0.05_200)] transition-colors"
            >
              {showStatus ? "Chat" : "Status"}
            </button>
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="px-3 py-1 text-xs border border-[color:oklch(0.3_0.05_200)] rounded hover:bg-[color:oklch(0.15_0.05_200)] transition-colors"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {showStatus && status ? (
          <div className="space-y-4 mb-6 text-xs">
            <h2 className="text-sm font-bold text-[color:oklch(0.8_0.15_190)]">ARQUITECTURA COGNITIVA</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[color:oklch(0.12_0.03_260)] border border-[color:oklch(0.2_0.05_260)] rounded-lg p-3">
                <div className="text-[color:oklch(0.6_0.05_200)] mb-1">SOUL</div>
                <div>{status.layers.soul.agents} agents · {status.layers.soul.policies} policies</div>
              </div>
              <div className="bg-[color:oklch(0.12_0.03_260)] border border-[color:oklch(0.2_0.05_260)] rounded-lg p-3">
                <div className="text-[color:oklch(0.6_0.05_200)] mb-1">Isa API</div>
                <div>{status.layers.isa.ok ? "🟢" : "🔴"} {status.layers.isa.model}</div>
              </div>
              <div className="bg-[color:oklch(0.12_0.03_260)] border border-[color:oklch(0.2_0.05_260)] rounded-lg p-3">
                <div className="text-[color:oklch(0.6_0.05_200)] mb-1">Mexa API</div>
                <div>{status.layers.mexa.ok ? "🟢" : "🔴"} {status.layers.mexa.federations.length} federations</div>
              </div>
              <div className="bg-[color:oklch(0.12_0.03_260)] border border-[color:oklch(0.2_0.05_260)] rounded-lg p-3">
                <div className="text-[color:oklch(0.6_0.05_200)] mb-1">ClawHub</div>
                <div>{status.layers.clawhub.total} skills ({status.layers.clawhub.approved} approved, {status.layers.clawhub.quarantine} quarantine)</div>
              </div>
              <div className="bg-[color:oklch(0.12_0.03_260)] border border-[color:oklch(0.2_0.05_260)] rounded-lg p-3">
                <div className="text-[color:oklch(0.6_0.05_200)] mb-1">Memory</div>
                <div>{status.layers.memory.total} entries · {Object.entries(status.layers.memory.byType).map(([k, v]) => `${k}:${v}`).join(" · ")}</div>
              </div>
              <div className="bg-[color:oklch(0.12_0.03_260)] border border-[color:oklch(0.2_0.05_260)] rounded-lg p-3">
                <div className="text-[color:oklch(0.6_0.05_200)] mb-1">Evaluation</div>
                <div>Quality: {(status.evaluation.quality * 100).toFixed(0)}% · Ethics: {(status.evaluation.ethical * 100).toFixed(0)}%</div>
              </div>
            </div>

            <h3 className="text-xs font-bold text-[color:oklch(0.6_0.05_200)] mt-4">SKILLS APROBADOS</h3>
            <div className="space-y-1">
              {status.skills.approved.map((skill) => (
                <div key={skill.name} className="bg-[color:oklch(0.1_0.02_250)] border border-[color:oklch(0.2_0.03_250)] rounded px-3 py-1.5 flex justify-between">
                  <span>{skill.name}</span>
                  <span className="text-[color:oklch(0.5_0.05_200)]">v{skill.version} · {skill.federation}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowStatus(false)}
              className="mt-4 px-4 py-2 text-xs border border-[color:oklch(0.3_0.05_200)] rounded hover:bg-[color:oklch(0.15_0.05_200)] transition-colors"
            >
              Volver al Chat
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="space-y-4 mb-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-lg text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[color:oklch(0.2_0.08_200)] text-[color:oklch(0.9_0.01_200)] border border-[color:oklch(0.3_0.1_200)]"
                        : "bg-[color:oklch(0.12_0.03_260)] text-[color:oklch(0.85_0.02_250)] border border-[color:oklch(0.2_0.05_260)]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[color:oklch(0.12_0.03_260)] border border-[color:oklch(0.2_0.05_260)] px-4 py-3 rounded-lg text-sm">
                    <span className="animate-pulse">▌</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={lang === "es" ? "Escribe tu consulta..." : "Type your question..."}
                className="flex-1 bg-[color:oklch(0.1_0.02_250)] border border-[color:oklch(0.25_0.05_200)] rounded-lg px-4 py-3 text-sm text-[color:oklch(0.9_0.01_250)] placeholder:text-[color:oklch(0.45_0.02_200)] focus:outline-none focus:border-[color:oklch(0.5_0.15_190)] transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-[color:oklch(0.4_0.15_190)] text-[color:oklch(0.95_0.01_250)] rounded-lg text-sm font-semibold hover:bg-[color:oklch(0.5_0.15_190)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {lang === "es" ? "Enviar" : "Send"}
              </button>
            </div>
          </>
        )}

        <p className="text-[10px] text-center mt-6 text-[color:oklch(0.4_0.02_200)]">
          Isabella Villaseñor — Sistema Operativo Cognitivo Soberano del ecosistema TAMV.
          5 capas: SOUL · Isa API · Mexa API · ClawHub · Multimodal.
        </p>
      </div>
    </div>
  );
}
