"use client";

import { useState } from "react";

const LANGUAGES = [
  { v: "",        l: "Select language…",        flag: "" },
  { v: "en",      l: "English",                 flag: "🇬🇧" },
  { v: "es",      l: "Spanish",                 flag: "🇪🇸" },
  { v: "fr",      l: "French",                  flag: "🇫🇷" },
  { v: "de",      l: "German",                  flag: "🇩🇪" },
  { v: "it",      l: "Italian",                 flag: "🇮🇹" },
  { v: "pt",      l: "Portuguese",              flag: "🇵🇹" },
  { v: "nl",      l: "Dutch",                   flag: "🇳🇱" },
  { v: "pl",      l: "Polish",                  flag: "🇵🇱" },
  { v: "ru",      l: "Russian",                 flag: "🇷🇺" },
  { v: "sr",      l: "Serbian (Latin)",         flag: "🇷🇸" },
  { v: "sr-cyrl", l: "Serbian (Cyrillic)",      flag: "🇷🇸" },
  { v: "ar",      l: "Arabic",                  flag: "🇸🇦" },
  { v: "zh",      l: "Chinese (Simplified)",    flag: "🇨🇳" },
  { v: "ja",      l: "Japanese",                flag: "🇯🇵" },
  { v: "ko",      l: "Korean",                  flag: "🇰🇷" },
  { v: "tr",      l: "Turkish",                 flag: "🇹🇷" },
];

export interface ConversationSettingsFields {
  iDontKnowMessage: string;
  starterQuestionsEnabled: boolean;
  starterQuestions: string[];
  starterQuestionsHeader: string;
  starterQuestionsExpand: string;
  starterQuestionsCollapse: string;
  agentLanguage: string;
  placeholderPrompt: string;
  loadingIndicator: "typing-dots" | "custom-message";
  loadingCustomMessage: string;
  customMessageEnding: string;
  errorMessage: string;
  failedModerationMessage: string;
  conversationDuration: "unlimited" | "24h" | "session";
  markdownInResponses: boolean;
}

const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0" style={{ color: "var(--cg-fg-4)" }}>
    <path d="M8 1l1.2 2.6 2.8.4-2 2 .5 2.8L8 7.5 5.5 8.8 6 6 4 4l2.8-.4L8 1z" fill="currentColor" opacity="0.5" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: "var(--cg-fg-4)" }} className="shrink-0">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="cg-toggle-wrap">
      <div className="cg-toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="cg-toggle-track" />
        <div className="cg-toggle-thumb" />
      </div>
      <span className={`cg-toggle-label ${checked ? "on" : ""}`}>{checked ? "ON" : "OFF"}</span>
    </label>
  );
}

function RadioOpt<T extends string>({ name, value, current, onChange, label, children }: {
  name: string; value: T; current: T; onChange: (v: T) => void; label: string; children?: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <div
        onClick={() => onChange(value)}
        style={{
          width: 16, height: 16, borderRadius: "50%",
          border: `2px solid ${current === value ? "var(--cg-primary)" : "var(--cg-border)"}`,
          background: "var(--cg-bg-card)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
        }}
      >
        {current === value && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cg-primary)" }} />}
      </div>
      <span onClick={() => onChange(value)} style={{ font: `${current === value ? "500" : "400"} 13px/18px var(--cg-font)`, color: "var(--cg-fg-1)", cursor: "pointer" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function Section({ label, info, description, children }: {
  label: string; info?: boolean; description?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "18px 0", borderBottom: "1px solid var(--cg-divider)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: description ? 4 : 10 }}>
        <SettingsIcon />
        <span style={{ font: "600 13px/18px var(--cg-font)", color: "var(--cg-fg-1)" }}>{label}</span>
        {info && <InfoIcon />}
      </div>
      {description && <p className="helper-text" style={{ marginBottom: 10, marginLeft: 0 }}>{description}</p>}
      {children}
    </div>
  );
}

export default function ConversationSettings({
  s,
  set,
}: {
  s: ConversationSettingsFields;
  set: (k: keyof ConversationSettingsFields, v: unknown) => void;
}) {
  const [newQuestion, setNewQuestion] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const addQuestion = () => {
    const q = newQuestion.trim();
    if (!q) return;
    set("starterQuestions", [...s.starterQuestions, q]);
    set("starterQuestionsEnabled", true);
    setNewQuestion("");
  };

  const removeQuestion = (i: number) => {
    const next = s.starterQuestions.filter((_, idx) => idx !== i);
    set("starterQuestions", next);
    if (next.length === 0) set("starterQuestionsEnabled", false);
  };

  const commitEdit = () => {
    if (editingIndex === null) return;
    const updated = [...s.starterQuestions];
    updated[editingIndex] = editingValue.trim() || updated[editingIndex];
    set("starterQuestions", updated);
    setEditingIndex(null);
  };

  return (
    <div>
      {/* I don't know message */}
      <Section label="I don't know message" info description="How should your agent respond if it's not able to answer a user's query?">
        <input className="cg-input" value={s.iDontKnowMessage} onChange={(e) => set("iDontKnowMessage", e.target.value)} placeholder="e.g. I don't have information on that topic." />
      </Section>

      {/* Starter Questions */}
      <Section label="Starter Questions" info>
        {/* Context-rich toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ font: "400 13px/18px var(--cg-font)", color: "var(--cg-fg-2)" }}>Use context-rich Starter Questions</span>
          <InfoIcon />
          <Toggle checked={s.starterQuestionsEnabled} onChange={(v) => set("starterQuestionsEnabled", v)} />
        </div>
        <a href="#" className="helper-link" style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
          Learn more <i className="ti ti-arrow-up-right" style={{ fontSize: 10 }} />
        </a>
        <div style={{ marginBottom: 12 }}>
          <button
            disabled={!s.starterQuestionsEnabled}
            style={{
              padding: "6px 12px", fontSize: 12, borderRadius: 6,
              border: "1px solid var(--cg-border)", background: "var(--cg-bg-card)",
              color: s.starterQuestionsEnabled ? "var(--cg-fg-2)" : "var(--cg-fg-4)",
              cursor: s.starterQuestionsEnabled ? "pointer" : "not-allowed",
              fontFamily: "var(--cg-font)",
            }}
          >
            Manage context-rich Starter Questions…
          </button>
        </div>

        {/* Question list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
          {s.starterQuestions.map((q, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {editingIndex === i ? (
                <input
                  autoFocus
                  className="cg-input"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                  style={{ flex: 1 }}
                />
              ) : (
                <span className="cg-input" style={{ flex: 1, display: "block", padding: "8px 12px", fontSize: 13, color: "var(--cg-fg-1)" }}>{q}</span>
              )}
              <button
                onClick={() => { setEditingIndex(i); setEditingValue(q); }}
                style={{ padding: 6, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", color: "var(--cg-fg-3)" }}
              >
                <i className="ti ti-pencil" style={{ fontSize: 14 }} />
              </button>
              <button
                onClick={() => removeQuestion(i)}
                style={{ padding: 6, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", color: "var(--cg-fg-3)" }}
              >
                <i className="ti ti-trash" style={{ fontSize: 14 }} />
              </button>
            </div>
          ))}
        </div>

        {/* Add question */}
        <div style={{ display: "flex", gap: 6 }}>
          <input
            className="cg-input"
            style={{ flex: 1 }}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addQuestion()}
            placeholder="Enter a sample question here"
          />
          <button
            onClick={addQuestion}
            style={{
              width: 36, height: 36, borderRadius: 8, border: "1px solid var(--cg-border)",
              background: "var(--cg-bg-card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--cg-fg-3)", flexShrink: 0,
            }}
          >
            <i className="ti ti-plus" style={{ fontSize: 16 }} />
          </button>
        </div>
      </Section>

      {/* Starter Questions Header */}
      <Section label="Starter Questions Header">
        <input className="cg-input" value={s.starterQuestionsHeader} onChange={(e) => set("starterQuestionsHeader", e.target.value)} placeholder="e.g. How can I help you?" />
      </Section>

      {/* Starter Questions Expand */}
      <Section label="Starter Questions Expand">
        <input className="cg-input" value={s.starterQuestionsExpand} onChange={(e) => set("starterQuestionsExpand", e.target.value)} placeholder="e.g. See more" />
      </Section>

      {/* Starter Questions Collapse */}
      <Section label="Starter Questions Collapse">
        <input className="cg-input" value={s.starterQuestionsCollapse} onChange={(e) => set("starterQuestionsCollapse", e.target.value)} placeholder="e.g. See less" />
      </Section>

      {/* Agent Language */}
      <Section label="Agent Language" info>
        {!s.agentLanguage && (
          <div className="cg-alert cg-alert-warning" style={{ marginBottom: 10 }}>
            <i className="ti ti-alert-triangle" />
            <span>Agent language is not set — your agent will respond in English by default.</span>
          </div>
        )}
        <select
          className={`cg-select ${!s.agentLanguage ? "warn" : ""}`}
          value={s.agentLanguage}
          onChange={(e) => set("agentLanguage", e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.v} value={l.v}>{l.flag ? `${l.flag} ${l.l}` : l.l}</option>
          ))}
        </select>
      </Section>

      {/* Placeholder Prompt */}
      <Section label="Placeholder Prompt" info>
        <input className="cg-input" value={s.placeholderPrompt} onChange={(e) => set("placeholderPrompt", e.target.value)} placeholder="Ask me anything…" />
      </Section>

      {/* Loading Indicator */}
      <Section label="Loading Indicator" info>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <RadioOpt name="loading" value="typing-dots" current={s.loadingIndicator} onChange={(v) => set("loadingIndicator", v)} label="Typing dots">
            <div style={{ display: "flex", gap: 3, marginLeft: 4 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: "50%", background: "var(--cg-primary)",
                  display: "inline-block", animation: `cg-bounce 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </RadioOpt>
          <RadioOpt name="loading" value="custom-message" current={s.loadingIndicator} onChange={(v) => set("loadingIndicator", v)} label="Custom message">
            <input
              className="cg-input"
              style={{ flex: 1, marginLeft: 4 }}
              disabled={s.loadingIndicator !== "custom-message"}
              value={s.loadingCustomMessage}
              onChange={(e) => set("loadingCustomMessage", e.target.value)}
              placeholder="e.g. Looking it up…"
            />
          </RadioOpt>
        </div>
      </Section>

      {/* Custom Message Ending */}
      <Section label="Custom Message Ending" info>
        <input className="cg-input" value={s.customMessageEnding} onChange={(e) => set("customMessageEnding", e.target.value)} placeholder="Optional text appended to all responses" />
      </Section>

      {/* Error Message */}
      <Section label="Error Message" info>
        <input className="cg-input" value={s.errorMessage} onChange={(e) => set("errorMessage", e.target.value)} />
      </Section>

      {/* Failed moderation message */}
      <Section label="Failed moderation message" info>
        <input className="cg-input" value={s.failedModerationMessage} onChange={(e) => set("failedModerationMessage", e.target.value)} />
      </Section>

      {/* Conversation Duration */}
      <Section label="Conversation Duration" info>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {([
            ["unlimited", "Unlimited",           "Conversation context has no time limit"],
            ["24h",       "24-hour memory limit", "Context resets after 24 hours of inactivity"],
            ["session",   "24 hours, then close", "Context resets when the browser is closed"],
          ] as const).map(([v, l, d]) => (
            <label key={v} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
              <div
                onClick={() => set("conversationDuration", v)}
                style={{
                  width: 16, height: 16, borderRadius: "50%", marginTop: 1,
                  border: `2px solid ${s.conversationDuration === v ? "var(--cg-primary)" : "var(--cg-border)"}`,
                  background: "var(--cg-bg-card)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                {s.conversationDuration === v && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cg-primary)" }} />}
              </div>
              <div onClick={() => set("conversationDuration", v)} style={{ cursor: "pointer" }}>
                <div style={{ font: "500 13px/18px var(--cg-font)", color: "var(--cg-fg-1)" }}>{l}</div>
                <div style={{ font: "400 11px/16px var(--cg-font)", color: "var(--cg-fg-4)", marginTop: 2 }}>{d}</div>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* Markdown in Responses */}
      <Section label="Markdown in Responses" info>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {([["enabled", true], ["disabled", false]] as const).map(([l, v]) => (
            <label key={l} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div
                onClick={() => set("markdownInResponses", v)}
                style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: `2px solid ${s.markdownInResponses === v ? "var(--cg-primary)" : "var(--cg-border)"}`,
                  background: "var(--cg-bg-card)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                {s.markdownInResponses === v && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cg-primary)" }} />}
              </div>
              <span onClick={() => set("markdownInResponses", v)} style={{ font: `${s.markdownInResponses === v ? "500" : "400"} 13px/18px var(--cg-font)`, color: "var(--cg-fg-1)", cursor: "pointer", textTransform: "capitalize" }}>{l}</span>
            </label>
          ))}
        </div>
      </Section>

      <style>{`
        @keyframes cg-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
