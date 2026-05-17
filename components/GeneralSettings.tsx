"use client";

import { useRef, useState } from "react";

const AGENT_ROLE_OPTIONS = [
  { value: "enterprise-search", label: "Enterprise Search" },
  { value: "customer-support",  label: "Customer Support" },
  { value: "lead-generation",   label: "Lead Generation" },
  { value: "knowledge-base",    label: "Knowledge Base" },
  { value: "general",           label: "General Assistant" },
];

export interface GeneralSettingsFields {
  agentName: string;
  agentRole: string;
  avatarInitials: string;
  agentAvatarUrl: string;
  colorScheme: "adaptive" | "legacy";
  agentColor: string;
  agentStyle: "sharp" | "soft" | "round";
  fontFamily: "inter" | "public-sans";
  backgroundType: "color" | "image";
  backgroundColor: string;
}

const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0" style={{ color: "var(--cg-fg-4)" }}>
    <path d="M8 1l1.2 2.6 2.8.4-2 2 .5 2.8L8 7.5 5.5 8.8 6 6 4 4l2.8-.4L8 1z" fill="currentColor" opacity="0.5" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

function InfoIcon({ tooltip }: { tooltip?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="shrink-0"
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: "var(--cg-fg-4)", cursor: "default" }}>
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      {tooltip && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%",
          transform: "translateX(-50%)", zIndex: 50, pointerEvents: "none",
          opacity: show ? 1 : 0, transition: "opacity 120ms, transform 120ms",
          translate: show ? "0 0" : "0 4px",
        }}>
          <div style={{
            background: "var(--cg-fg-1)", color: "#fff",
            font: "400 11px/1.4 var(--cg-font)",
            borderRadius: 6, padding: "5px 10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            maxWidth: 260, whiteSpace: "normal", textAlign: "center",
          }}>
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, info, extra, children }: {
  label: string; info?: boolean; extra?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "18px 0", borderBottom: "1px solid var(--cg-divider)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <SettingsIcon />
        <span style={{ font: "600 13px/18px var(--cg-font)", color: "var(--cg-fg-1)" }}>{label}</span>
        {info && <InfoIcon />}
        {extra && <span style={{ marginLeft: "auto" }}>{extra}</span>}
      </div>
      {children}
    </div>
  );
}

function RadioGroup<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string; desc?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {options.map((opt) => (
        <label key={opt.value} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
          <div
            onClick={() => onChange(opt.value)}
            style={{
              width: 16, height: 16, borderRadius: "50%", marginTop: 1,
              border: `2px solid ${value === opt.value ? "var(--cg-primary)" : "var(--cg-border)"}`,
              background: "var(--cg-bg-card)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            {value === opt.value && (
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cg-primary)" }} />
            )}
          </div>
          <div onClick={() => onChange(opt.value)} style={{ cursor: "pointer" }}>
            <div style={{ font: "500 13px/18px var(--cg-font)", color: "var(--cg-fg-1)" }}>{opt.label}</div>
            {opt.desc && <div style={{ font: "400 11px/16px var(--cg-font)", color: "var(--cg-fg-4)", marginTop: 2 }}>{opt.desc}</div>}
          </div>
        </label>
      ))}
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const pickerRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="cg-input" style={{ display: "flex", alignItems: "center", maxWidth: 200, padding: "0 10px 0 4px" }}>
        <button
          onClick={() => pickerRef.current?.click()}
          style={{ width: 24, height: 24, borderRadius: 6, background: value, border: "1px solid var(--cg-border)", cursor: "pointer", flexShrink: 0, marginRight: 8 }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ border: "none", outline: "none", background: "transparent", font: "400 13px/18px var(--cg-font)", color: "var(--cg-fg-1)", width: "100%", fontFamily: "monospace" }}
          placeholder="#000000"
        />
      </div>
      <input ref={pickerRef} type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function GeneralSettings({
  s,
  set,
}: {
  s: GeneralSettingsFields;
  set: (k: keyof GeneralSettingsFields, v: unknown) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("agentAvatarUrl", URL.createObjectURL(file));
  };

  return (
    <div>
      {/* Identity group — Name, Role, Avatar */}
      <div style={{ padding: "18px 0", borderBottom: "1px solid var(--cg-divider)" }}>
      <div className="settings-card" style={{ padding: "16px 20px", background: "#fff" }}>
        {/* Agent Name */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <SettingsIcon />
            <span style={{ font: "600 13px/18px var(--cg-font)", color: "var(--cg-fg-1)" }}>Agent Name</span>
          </div>
          <input
            className="cg-input"
            value={s.agentName}
            onChange={(e) => {
              const v = e.target.value;
              set("agentName", v);
              const initials = v.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
              set("avatarInitials", initials);
            }}
            placeholder="e.g. Support Bot, Sales Assistant"
          />
        </div>

        {/* Agent Role */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <SettingsIcon />
            <span style={{ font: "600 13px/18px var(--cg-font)", color: "var(--cg-fg-1)" }}>Agent Role</span>
            <InfoIcon tooltip="Sets the primary purpose of this agent. Used to tailor default behavior, suggested prompts, and knowledge retrieval strategy." />
            <a href="#" className="helper-link" style={{ fontSize: 12, marginLeft: "auto" }}>
              Learn more <i className="ti ti-arrow-up-right" style={{ fontSize: 10 }} />
            </a>
          </div>
          <select
            className="cg-select"
            value={s.agentRole}
            onChange={(e) => set("agentRole", e.target.value)}
          >
            {AGENT_ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Agent Avatar */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <SettingsIcon />
            <span style={{ font: "600 13px/18px var(--cg-font)", color: "var(--cg-fg-1)" }}>Agent Avatar</span>
            <InfoIcon tooltip="Upload a square image for your agent's avatar. Shown in the chat bubble and selection modal. Max 800 KB — JPG, GIF, or PNG." />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              border: "2px solid var(--cg-border)", overflow: "hidden",
              background: s.agentAvatarUrl ? undefined : s.agentColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {s.agentAvatarUrl
                ? <img src={s.agentAvatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ font: "600 18px/1 var(--cg-font)", color: "#fff" }}>{s.avatarInitials}</span>
              }
            </div>
            <div>
              <p className="helper-text" style={{ marginBottom: 8 }}>Upload square image only. Allowed are JPG, GIF or PNG image up to 800 Kb.</p>
              <button
                className="cg-btn cg-btn-neutral cg-btn-sm"
                onClick={() => fileRef.current?.click()}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <i className="ti ti-upload" style={{ fontSize: 13 }} />
                Change Avatar
              </button>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.gif,.png" style={{ display: "none" }} onChange={handleAvatarChange} />
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Agent Color Scheme */}
      <Section label="Agent Color Scheme" info>
        <RadioGroup
          options={[
            { value: "adaptive", label: "Adaptive", desc: "Follows the user's dark / light mode" },
            { value: "legacy",   label: "Legacy",   desc: "Always shows your primary color" },
          ]}
          value={s.colorScheme}
          onChange={(v) => set("colorScheme", v)}
        />
      </Section>

      {/* Agent Color */}
      <Section label="Agent Color">
        <p className="helper-text" style={{ marginBottom: 8 }}>Primary color</p>
        <ColorInput
          value={s.agentColor}
          onChange={(v) => { set("agentColor", v); set("backgroundColor", v); }}
        />
      </Section>

      {/* Agent Style */}
      <Section label="Agent Style" info>
        <RadioGroup
          options={[
            { value: "sharp", label: "Sharp" },
            { value: "soft",  label: "Soft"  },
            { value: "round", label: "Round" },
          ]}
          value={s.agentStyle}
          onChange={(v) => set("agentStyle", v)}
        />
      </Section>

      {/* Font Family */}
      <Section label="Font Family">
        <RadioGroup
          options={[
            { value: "inter",       label: "Inter"       },
            { value: "public-sans", label: "Public Sans" },
          ]}
          value={s.fontFamily}
          onChange={(v) => set("fontFamily", v)}
        />
      </Section>

      {/* Background */}
      <Section label="Background">
        <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
          {(["image", "color"] as const).map((type) => (
            <label key={type} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
              <div
                onClick={() => set("backgroundType", type)}
                style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: `2px solid ${s.backgroundType === type ? "var(--cg-primary)" : "var(--cg-border)"}`,
                  background: "var(--cg-bg-card)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                {s.backgroundType === type && (
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cg-primary)" }} />
                )}
              </div>
              <span
                onClick={() => set("backgroundType", type)}
                style={{ font: "500 13px/18px var(--cg-font)", color: "var(--cg-fg-1)", cursor: "pointer", textTransform: "capitalize" }}
              >
                Background {type === "image" ? "Image" : "Color"}
              </span>
            </label>
          ))}
        </div>
        {s.backgroundType === "color" && (
          <ColorInput value={s.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
        )}
      </Section>
    </div>
  );
}
