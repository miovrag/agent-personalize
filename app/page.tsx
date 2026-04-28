"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStyle = "sharp" | "soft" | "round";
type ColorScheme = "adaptive" | "legacy";
type FontFamily = "inter" | "public-sans";
type BackgroundType = "color" | "image";
type Visibility = "private" | "public";
type RetentionPeriod = "custom" | "12months" | "never";
type ConversationDuration = "unlimited" | "24h" | "session";
type SourceView = "opened" | "collapsed";

interface Settings {
  agentName: string;
  agentRole: string;
  avatarInitials: string;
  colorScheme: ColorScheme;
  agentColor: string;
  agentStyle: AgentStyle;
  fontFamily: FontFamily;
  backgroundType: BackgroundType;
  backgroundColor: string;
  iDontKnowMessage: string;
  starterQuestionsEnabled: boolean;
  starterQuestions: string[];
  starterQuestionsHeader: string;
  starterQuestionsExpand: string;
  starterQuestionsCollapse: string;
  agentLanguage: string;
  placeholderPrompt: string;
  loadingIndicator: string;
  customMessageEnding: string;
  errorMessage: string;
  failedModerationMessage: string;
  conversationDuration: ConversationDuration;
  markdownInResponses: boolean;
  enableCitations: boolean;
  numberedReferences: boolean;
  renderImageCitationsInline: boolean;
  loadImageHeight: boolean;
  useOpenGraphImages: boolean;
  maxImagesPerResponse: string;
  afterResponseHeader: string;
  afterResponseSource: string;
  showSourceView: SourceView;
  enablePDFViewer: boolean;
  autoOpenPDFViewer: boolean;
  preventPDFDownload: boolean;
  knowledgeBaseAwareness: boolean;
  allowKnowledgeBaseQueries: boolean;
  numericSearchOptimization: boolean;
  enableNumericSearch: boolean;
  conversationHistoryEnabled: boolean;
  userFeedback: boolean;
  showCopyButton: boolean;
  conversationSharing: boolean;
  conversationExporting: boolean;
  removeBranding: boolean;
  agentTitle: string;
  titleColor: string;
  titleAvatarEnabled: boolean;
  spotlightAvatarEnabled: boolean;
  userAvatarEnabled: boolean;
  avatarOrientation: string;
  agentTitleAlignment: string;
  inChatAgentAvatar: boolean;
  inChatUserAvatar: boolean;
  termsOfService: string;
  antiHallucination: boolean;
  agentVisibility: Visibility;
  recaptchaEnabled: boolean;
  whitelistedDomains: string;
  conversationRetention: RetentionPeriod;
  retentionDays: number;
}

const DEFAULTS: Settings = {
  agentName: "My Agent",
  agentRole: "enterprise-search",
  avatarInitials: "MA",
  colorScheme: "adaptive",
  agentColor: "#7367f0",
  agentStyle: "soft",
  fontFamily: "inter",
  backgroundType: "color",
  backgroundColor: "#7367f0",
  iDontKnowMessage: "I'm sorry, I don't have information about that. Please try rephrasing your question.",
  starterQuestionsEnabled: false,
  starterQuestions: [],
  starterQuestionsHeader: "My Agent",
  starterQuestionsExpand: "Show more",
  starterQuestionsCollapse: "Show less",
  agentLanguage: "",
  placeholderPrompt: "Ask me anything...",
  loadingIndicator: "typing",
  customMessageEnding: "",
  errorMessage: "Something went wrong. Please try again.",
  failedModerationMessage: "I'm unable to respond to that request.",
  conversationDuration: "unlimited",
  markdownInResponses: true,
  enableCitations: true,
  numberedReferences: true,
  renderImageCitationsInline: false,
  loadImageHeight: false,
  useOpenGraphImages: false,
  maxImagesPerResponse: "unlimited",
  afterResponseHeader: "Where did this answer come from?",
  afterResponseSource: "Source",
  showSourceView: "opened",
  enablePDFViewer: true,
  autoOpenPDFViewer: false,
  preventPDFDownload: false,
  knowledgeBaseAwareness: true,
  allowKnowledgeBaseQueries: true,
  numericSearchOptimization: false,
  enableNumericSearch: false,
  conversationHistoryEnabled: false,
  userFeedback: true,
  showCopyButton: true,
  conversationSharing: true,
  conversationExporting: true,
  removeBranding: false,
  agentTitle: "My Agent",
  titleColor: "#ffffff",
  titleAvatarEnabled: true,
  spotlightAvatarEnabled: true,
  userAvatarEnabled: true,
  avatarOrientation: "agent-left-user-right",
  agentTitleAlignment: "left",
  inChatAgentAvatar: true,
  inChatUserAvatar: false,
  termsOfService: "",
  antiHallucination: true,
  agentVisibility: "public",
  recaptchaEnabled: false,
  whitelistedDomains: "",
  conversationRetention: "never",
  retentionDays: 30,
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  Settings: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Chat: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Quote: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
    </svg>
  ),
  Brain: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.2-4.85A3 3 0 0 1 3.5 9.5a3 3 0 0 1 4-2.83A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.2-4.85A3 3 0 0 0 20.5 9.5a3 3 0 0 0-4-2.83A2.5 2.5 0 0 0 14.5 2z"/>
    </svg>
  ),
  Sliders: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Check: ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertTriangle: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Info: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Plus: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Pencil: ({ size = 13 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: ({ size = 13 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  ChevronDown: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  ChevronUp: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  ),
  Send: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Globe: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Image: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Lock: ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Rocket: ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
};

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="toggle-wrap" style={{ cursor: "pointer" }}>
      <div className="toggle">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className="toggle-track" />
        <div className="toggle-thumb" />
      </div>
      {label && <span className={`toggle-label ${checked ? "on" : ""}`}>{checked ? "Enabled" : "Disabled"}</span>}
    </label>
  );
}

// ─── Accordion component ──────────────────────────────────────────────────────

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        {open ? <Icon.ChevronUp /> : <Icon.ChevronDown />}
      </div>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

// ─── Field Row component ──────────────────────────────────────────────────────

function FieldRow({ icon, label, hint, children }: {
  icon: React.ReactNode; label: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="field-row">
      <div className="field-label-col">
        <span className="field-icon">{icon}</span>
        <div>
          <div className="field-label">{label}</div>
          {hint && <div className="field-hint">{hint}</div>}
        </div>
      </div>
      <div className="field-control">{children}</div>
    </div>
  );
}

// ─── General Tab ─────────────────────────────────────────────────────────────

function GeneralTab({ s, set }: { s: Settings; set: (k: keyof Settings, v: unknown) => void }) {
  const styleRadius = { sharp: "0px", soft: "8px", round: "20px" };

  return (
    <div>
      <FieldRow icon={<Icon.Settings />} label="Agent Name">
        <input
          className="input"
          value={s.agentName}
          onChange={e => {
            set("agentName", e.target.value);
            const initials = e.target.value.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
            set("avatarInitials", initials || "?");
            if (!s.agentTitle || s.agentTitle === s.agentName) set("agentTitle", e.target.value);
          }}
          placeholder="e.g. Support Bot, Sales Assistant"
        />
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Agent Role">
        <select className="select" value={s.agentRole} onChange={e => set("agentRole", e.target.value)}>
          <option value="enterprise-search">Enterprise Search</option>
          <option value="customer-support">Customer Support</option>
          <option value="lead-generation">Lead Generation</option>
          <option value="knowledge-base">Knowledge Base</option>
          <option value="general">General Assistant</option>
        </select>
        <div style={{ marginTop: 6 }}>
          <a href="#" className="link-text">Learn more ↗</a>
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Image />} label="Agent Avatar" hint="JPG, GIF or PNG · Max 800KB · Square recommended">
        <div className="avatar-zone">
          <div className="avatar-preview" style={{ background: s.agentColor }}>
            {s.avatarInitials}
          </div>
          <div>
            <button className="avatar-upload-btn">
              <Icon.Image size={13} />
              Change Avatar
            </button>
            <div className="avatar-hint">Upload square image only</div>
          </div>
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Agent Color Scheme">
        <div className="radio-group">
          {(["adaptive", "legacy"] as ColorScheme[]).map(v => (
            <label key={v} className="radio-option">
              <input type="radio" name="colorScheme" value={v} checked={s.colorScheme === v} onChange={() => set("colorScheme", v)} />
              <span className="radio-option-label">
                {v === "adaptive" ? "Adaptive" : "Legacy"}
                <small>{v === "adaptive" ? "Follows the user's dark/light mode" : "Always shows your primary color"}</small>
              </span>
            </label>
          ))}
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Agent Color">
        <div className="color-picker-wrap">
          <input
            type="color"
            className="color-swatch"
            value={s.agentColor}
            onChange={e => { set("agentColor", e.target.value); set("backgroundColor", e.target.value); }}
          />
          <input
            className="input"
            value={s.agentColor}
            onChange={e => { set("agentColor", e.target.value); set("backgroundColor", e.target.value); }}
            placeholder="#7367f0"
            style={{ flex: 1 }}
          />
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Agent Style">
        <div className="style-options">
          {(["sharp", "soft", "round"] as AgentStyle[]).map(style => (
            <div
              key={style}
              className={`style-option ${s.agentStyle === style ? "selected" : ""}`}
              onClick={() => set("agentStyle", style)}
            >
              <div
                className="style-preview-bubble"
                style={{ borderRadius: styleRadius[style] }}
              />
              <span className="style-option-label">{style.charAt(0).toUpperCase() + style.slice(1)}</span>
            </div>
          ))}
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Font Family">
        <div className="radio-group">
          {(["inter", "public-sans"] as FontFamily[]).map(v => (
            <label key={v} className="radio-option">
              <input type="radio" name="fontFamily" value={v} checked={s.fontFamily === v} onChange={() => set("fontFamily", v)} />
              <span className="radio-option-label" style={{ fontFamily: v === "inter" ? "Inter, sans-serif" : "Public Sans, sans-serif" }}>
                {v === "inter" ? "Inter" : "Public Sans"}
              </span>
            </label>
          ))}
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Image />} label="Background">
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="bgType" value="image" checked={s.backgroundType === "image"} onChange={() => set("backgroundType", "image")} />
            <span className="radio-option-label">Background Image</span>
          </label>
          <label className="radio-option">
            <input type="radio" name="bgType" value="color" checked={s.backgroundType === "color"} onChange={() => set("backgroundType", "color")} />
            <span className="radio-option-label">Background Color</span>
          </label>
        </div>
        {s.backgroundType === "color" && (
          <div className="color-picker-wrap" style={{ marginTop: 10 }}>
            <input type="color" className="color-swatch" value={s.backgroundColor} onChange={e => set("backgroundColor", e.target.value)} />
            <input className="input" value={s.backgroundColor} onChange={e => set("backgroundColor", e.target.value)} style={{ flex: 1 }} />
          </div>
        )}
      </FieldRow>
    </div>
  );
}

// ─── Conversation Tab ─────────────────────────────────────────────────────────

function ConversationTab({ s, set }: { s: Settings; set: (k: keyof Settings, v: unknown) => void }) {
  const [newQ, setNewQ] = useState("");

  const addQuestion = () => {
    if (!newQ.trim()) return;
    set("starterQuestions", [...s.starterQuestions, newQ.trim()]);
    setNewQ("");
  };

  const removeQuestion = (i: number) => {
    set("starterQuestions", s.starterQuestions.filter((_, idx) => idx !== i));
  };

  const LANGUAGES = [
    { value: "", label: "Select language..." },
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
    { value: "nl", label: "Dutch" },
    { value: "pl", label: "Polish" },
    { value: "ru", label: "Russian" },
    { value: "sr", label: "Serbian (Latin)" },
    { value: "sr-cyrl", label: "Serbian (Cyrillic)" },
    { value: "ar", label: "Arabic" },
    { value: "zh", label: "Chinese (Simplified)" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "tr", label: "Turkish" },
    { value: "uk", label: "Ukrainian" },
  ];

  return (
    <div>
      {!s.agentLanguage && (
        <div className="warning-banner">
          <Icon.AlertTriangle size={14} />
          <span>Agent language is not set — your agent will respond in English by default. Set it below.</span>
        </div>
      )}

      <FieldRow icon={<Icon.Globe size={14} />} label="Agent Language" hint="Language your agent uses for all responses">
        <select
          className="select"
          value={s.agentLanguage}
          onChange={e => set("agentLanguage", e.target.value)}
          style={!s.agentLanguage ? { borderColor: "#fcd34d" } : {}}
        >
          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        {s.agentLanguage && (
          <div style={{ marginTop: 6 }}>
            <span className="badge badge-green"><Icon.Check size={9} /> &nbsp;Language set</span>
          </div>
        )}
      </FieldRow>

      <FieldRow icon={<Icon.Chat />} label="I don't know message" hint="Shown when the agent can't answer">
        <textarea
          className="textarea"
          value={s.iDontKnowMessage}
          onChange={e => set("iDontKnowMessage", e.target.value)}
          rows={3}
        />
      </FieldRow>

      <FieldRow icon={<Icon.Chat />} label="Starter Questions">
        <Toggle checked={s.starterQuestionsEnabled} onChange={v => set("starterQuestionsEnabled", v)} label="toggle" />
        {s.starterQuestionsEnabled && (
          <div style={{ marginTop: 12 }}>
            <div className="starter-q-list">
              {s.starterQuestions.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--text-gray)", fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
                  No starter questions yet — add some below
                </div>
              )}
              {s.starterQuestions.map((q, i) => (
                <div key={i} className="starter-q-item">
                  <span className="starter-q-text">{q}</span>
                  <div className="starter-q-actions">
                    <button className="icon-btn danger" onClick={() => removeQuestion(i)}><Icon.Trash size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                className="input"
                value={newQ}
                onChange={e => setNewQ(e.target.value)}
                placeholder="Add a starter question..."
                onKeyDown={e => e.key === "Enter" && addQuestion()}
                style={{ flex: 1 }}
              />
              <button className="save-btn" style={{ padding: "8px 14px", borderRadius: 8 }} onClick={addQuestion}>Add</button>
            </div>
          </div>
        )}
      </FieldRow>

      {s.starterQuestionsEnabled && (
        <>
          <FieldRow icon={<Icon.Chat />} label="Starter Questions Header">
            <input className="input" value={s.starterQuestionsHeader} onChange={e => set("starterQuestionsHeader", e.target.value)} />
          </FieldRow>
          <FieldRow icon={<Icon.Chat />} label="Expand Label">
            <input className="input" value={s.starterQuestionsExpand} onChange={e => set("starterQuestionsExpand", e.target.value)} placeholder="Show more" />
          </FieldRow>
          <FieldRow icon={<Icon.Chat />} label="Collapse Label">
            <input className="input" value={s.starterQuestionsCollapse} onChange={e => set("starterQuestionsCollapse", e.target.value)} placeholder="Show less" />
          </FieldRow>
        </>
      )}

      <FieldRow icon={<Icon.Chat />} label="Placeholder Prompt">
        <input className="input" value={s.placeholderPrompt} onChange={e => set("placeholderPrompt", e.target.value)} placeholder="Ask me anything..." />
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Loading Indicator">
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="loading" value="typing" checked={s.loadingIndicator === "typing"} onChange={() => set("loadingIndicator", "typing")} />
            <span className="radio-option-label">Typing dot animation</span>
          </label>
          <label className="radio-option">
            <input type="radio" name="loading" value="spinner" checked={s.loadingIndicator === "spinner"} onChange={() => set("loadingIndicator", "spinner")} />
            <span className="radio-option-label">Spinner</span>
          </label>
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Chat />} label="Custom Message Ending">
        <input className="input" value={s.customMessageEnding} onChange={e => set("customMessageEnding", e.target.value)} placeholder="Optional message appended to all responses" />
      </FieldRow>

      <FieldRow icon={<Icon.Chat />} label="Error Message">
        <input className="input" value={s.errorMessage} onChange={e => set("errorMessage", e.target.value)} />
      </FieldRow>

      <FieldRow icon={<Icon.Chat />} label="Failed Moderation Message">
        <input className="input" value={s.failedModerationMessage} onChange={e => set("failedModerationMessage", e.target.value)} />
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Conversation Duration">
        <div className="radio-group">
          {([
            ["unlimited", "Unlimited", "Conversation context has no limit"],
            ["24h", "24-hour memory limit", "Context resets after 24 hours of inactivity"],
            ["session", "Session only", "Context resets when the browser is closed"],
          ] as [ConversationDuration, string, string][]).map(([v, l, d]) => (
            <label key={v} className="radio-option">
              <input type="radio" name="duration" value={v} checked={s.conversationDuration === v} onChange={() => set("conversationDuration", v)} />
              <span className="radio-option-label">{l}<small>{d}</small></span>
            </label>
          ))}
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Markdown in Responses">
        <Toggle checked={s.markdownInResponses} onChange={v => set("markdownInResponses", v)} label="toggle" />
      </FieldRow>
    </div>
  );
}

// ─── Citations Tab ────────────────────────────────────────────────────────────

function CitationsTab({ s, set }: { s: Settings; set: (k: keyof Settings, v: unknown) => void }) {
  return (
    <div>
      <FieldRow icon={<Icon.Quote />} label="Enable Citations" hint="Show source references in responses">
        <Toggle checked={s.enableCitations} onChange={v => set("enableCitations", v)} label="toggle" />
      </FieldRow>

      {s.enableCitations && (
        <>
          <div style={{ padding: "14px 0 4px" }}>
            <div className="section-label">Citation Types</div>
          </div>

          <FieldRow icon={<Icon.Quote />} label="Numbered References" hint="Inline numbered citations in response text">
            <Toggle checked={s.numberedReferences} onChange={v => set("numberedReferences", v)} label="toggle" />
          </FieldRow>

          <FieldRow icon={<Icon.Image />} label="Render Image Citations Inline" hint="Display images directly in the chat">
            <Toggle checked={s.renderImageCitationsInline} onChange={v => set("renderImageCitationsInline", v)} label="toggle" />
          </FieldRow>

          {s.renderImageCitationsInline && (
            <FieldRow icon={<Icon.Image />} label="Load Image Height">
              <Toggle checked={s.loadImageHeight} onChange={v => set("loadImageHeight", v)} label="toggle" />
            </FieldRow>
          )}

          <FieldRow icon={<Icon.Globe size={14} />} label="OpenGraph Images for Web Pages">
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Toggle checked={s.useOpenGraphImages} onChange={v => set("useOpenGraphImages", v)} label="toggle" />
              <span className="badge badge-purple">BETA</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-gray)", marginTop: 4 }}>
              Display the page&apos;s image instead of a text citation
            </div>
          </FieldRow>

          <FieldRow icon={<Icon.Image />} label="Max Images per Response">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["1", "2", "3", "4", "5", "unlimited"].map(v => (
                <label key={v} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="maxImages"
                    value={v}
                    checked={s.maxImagesPerResponse === v}
                    onChange={() => set("maxImagesPerResponse", v)}
                    style={{ accentColor: "var(--purple)" }}
                  />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{v === "unlimited" ? "Unlimited" : v}</span>
                </label>
              ))}
            </div>
          </FieldRow>

          <div style={{ padding: "14px 0 4px" }}>
            <div className="section-label">After Response (Classic Citations)</div>
          </div>

          <FieldRow icon={<Icon.Quote />} label="Section Header">
            <input className="input" value={s.afterResponseHeader} onChange={e => set("afterResponseHeader", e.target.value)} placeholder="Where did this answer come from?" />
          </FieldRow>

          <FieldRow icon={<Icon.Quote />} label="Source Label">
            <input className="input" value={s.afterResponseSource} onChange={e => set("afterResponseSource", e.target.value)} placeholder="Source" />
          </FieldRow>

          <FieldRow icon={<Icon.Settings />} label="Show Source View">
            <select className="select" value={s.showSourceView} onChange={e => set("showSourceView", e.target.value as SourceView)}>
              <option value="opened">Opened</option>
              <option value="collapsed">Collapsed</option>
            </select>
          </FieldRow>

          <div style={{ padding: "14px 0 4px" }}>
            <div className="section-label">PDF Citations</div>
          </div>

          <FieldRow icon={<Icon.Quote />} label="Enable PDF Viewer">
            <Toggle checked={s.enablePDFViewer} onChange={v => set("enablePDFViewer", v)} label="toggle" />
          </FieldRow>
          {s.enablePDFViewer && (
            <>
              <FieldRow icon={<Icon.Quote />} label="Auto-open PDF Viewer">
                <Toggle checked={s.autoOpenPDFViewer} onChange={v => set("autoOpenPDFViewer", v)} label="toggle" />
              </FieldRow>
              <FieldRow icon={<Icon.Quote />} label="Prevent PDF Download">
                <Toggle checked={s.preventPDFDownload} onChange={v => set("preventPDFDownload", v)} label="toggle" />
              </FieldRow>
            </>
          )}

          <div style={{ marginTop: 20 }}>
            <Accordion title="Additional Settings">
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {([
                    ["knowledgeBaseAwareness", "Knowledge Base Awareness", "Agent can describe what sources and files it has access to"],
                    ["allowKnowledgeBaseQueries", "Allow Knowledge Base Queries", "Users can ask what sources the agent uses"],
                    ["numericSearchOptimization", "Numeric Search Optimization", "Better results when querying for product codes, SKUs, or reference numbers"],
                    ["enableNumericSearch", "Enable Numeric Search", "Allows more accurate matching on part numbers and alphanumeric codes"],
                  ] as [keyof Settings, string, string][]).map(([key, label, desc]) => (
                    <div key={key}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{label}</span>
                        <Toggle checked={s[key] as boolean} onChange={v => set(key, v)} />
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-gray)" }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Advanced Tab ─────────────────────────────────────────────────────────────

function AdvancedTab({ s, set }: { s: Settings; set: (k: keyof Settings, v: unknown) => void }) {
  return (
    <div>
      <FieldRow icon={<Icon.Chat />} label="End-user Conversation History" hint="Users can resume past conversations">
        <Toggle checked={s.conversationHistoryEnabled} onChange={v => set("conversationHistoryEnabled", v)} label="toggle" />
        {s.conversationHistoryEnabled && (
          <div className="sub-section" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
              Show history across:
            </div>
            <div className="radio-group">
              {["Everyone", "Team members only", "Others (guests)"].map(opt => (
                <label key={opt} className="radio-option">
                  <input type="radio" name="historyScope" value={opt} defaultChecked={opt === "Everyone"} />
                  <span className="radio-option-label">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="User Feedback">
        <Toggle checked={s.userFeedback} onChange={v => set("userFeedback", v)} label="toggle" />
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Show Copy Button">
        <Toggle checked={s.showCopyButton} onChange={v => set("showCopyButton", v)} label="toggle" />
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Conversation Sharing">
        <Toggle checked={s.conversationSharing} onChange={v => set("conversationSharing", v)} label="toggle" />
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Conversation Exporting">
        <Toggle checked={s.conversationExporting} onChange={v => set("conversationExporting", v)} label="toggle" />
      </FieldRow>

      <div style={{ padding: "14px 0 4px" }}>
        <div className="section-label">Branding</div>
      </div>

      <FieldRow icon={<Icon.Settings />} label="Remove Branding">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Powered by CustomGPT.ai</span>
          <Toggle checked={s.removeBranding} onChange={v => set("removeBranding", v)} />
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Agent Title">
        <input className="input" value={s.agentTitle} onChange={e => set("agentTitle", e.target.value)} />
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Title Color">
        <div className="color-picker-wrap">
          <input type="color" className="color-swatch" value={s.titleColor} onChange={e => set("titleColor", e.target.value)} />
          <input className="input" value={s.titleColor} onChange={e => set("titleColor", e.target.value)} style={{ flex: 1 }} />
        </div>
      </FieldRow>

      <div style={{ padding: "14px 0 4px" }}>
        <div className="section-label">Avatars</div>
      </div>

      <FieldRow icon={<Icon.User />} label="Title Avatar">
        <Toggle checked={s.titleAvatarEnabled} onChange={v => set("titleAvatarEnabled", v)} label="toggle" />
      </FieldRow>

      <FieldRow icon={<Icon.User />} label="Spotlight Avatar">
        <Toggle checked={s.spotlightAvatarEnabled} onChange={v => set("spotlightAvatarEnabled", v)} label="toggle" />
        {s.spotlightAvatarEnabled && (
          <div className="radio-group" style={{ marginTop: 10 }}>
            {[
              ["icon-space", "Use icon-space avatar"],
              ["agent-avatar", "Use item agent avatar"],
              ["round", "Round spotlight avatar shape"],
            ].map(([v, l]) => (
              <label key={v} className="radio-option">
                <input type="radio" name="spotlightType" value={v} defaultChecked={v === "agent-avatar"} />
                <span className="radio-option-label">{l}</span>
              </label>
            ))}
          </div>
        )}
      </FieldRow>

      <FieldRow icon={<Icon.User />} label="User Avatar">
        <Toggle checked={s.userAvatarEnabled} onChange={v => set("userAvatarEnabled", v)} label="toggle" />
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Avatar Orientations">
        <select className="select" value={s.avatarOrientation} onChange={e => set("avatarOrientation", e.target.value)}>
          <option value="agent-left-user-right">Agent left, User right</option>
          <option value="agent-right-user-left">Agent right, User left</option>
        </select>
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Agent Title & Avatar Alignment">
        <select className="select" value={s.agentTitleAlignment} onChange={e => set("agentTitleAlignment", e.target.value)}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </FieldRow>

      <FieldRow icon={<Icon.User />} label="In-Chat Avatars">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Agent Avatar</span>
            <Toggle checked={s.inChatAgentAvatar} onChange={v => set("inChatAgentAvatar", v)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>User Avatar</span>
            <Toggle checked={s.inChatUserAvatar} onChange={v => set("inChatUserAvatar", v)} />
          </div>
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Terms of Service">
        <textarea
          className="textarea"
          value={s.termsOfService}
          onChange={e => set("termsOfService", e.target.value)}
          placeholder="Enter your terms of service text here..."
          rows={3}
        />
      </FieldRow>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab({ s, set }: { s: Settings; set: (k: keyof Settings, v: unknown) => void }) {
  return (
    <div>
      <FieldRow icon={<Icon.Shield />} label="Anti-Hallucination" hint="Prevents the agent from generating unsupported content">
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="antiH" value="enabled" checked={s.antiHallucination} onChange={() => set("antiHallucination", true)} />
            <span className="radio-option-label">Enabled</span>
          </label>
          <label className="radio-option">
            <input type="radio" name="antiH" value="disabled" checked={!s.antiHallucination} onChange={() => set("antiHallucination", false)} />
            <span className="radio-option-label">
              Disabled
              <small style={{ color: "var(--red)" }}>Not recommended for production agents</small>
            </span>
          </label>
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Lock size={14} />} label="Agent Visibility">
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="visibility" value="private" checked={s.agentVisibility === "private"} onChange={() => set("agentVisibility", "private")} />
            <span className="radio-option-label">Private<small>Only accessible with a direct link or embed</small></span>
          </label>
          <label className="radio-option">
            <input type="radio" name="visibility" value="public" checked={s.agentVisibility === "public"} onChange={() => set("agentVisibility", "public")} />
            <span className="radio-option-label">Public<small>Anyone can find and interact with your agent</small></span>
          </label>
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Shield />} label="Data Protection">
        <div className="info-banner">
          <Icon.Info size={14} />
          <span>
            CustomGPT.ai is SOC 2 Type II certified and fully GDPR compliant. Your data and your users&apos; data are safe with us.{" "}
            <a href="#" className="link-text">Trust Center ↗</a>
          </span>
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Shield />} label="Recaptcha">
        <div className="radio-group">
          <label className="radio-option">
            <input type="radio" name="recaptcha" value="enabled" checked={s.recaptchaEnabled} onChange={() => set("recaptchaEnabled", true)} />
            <span className="radio-option-label">Enabled</span>
          </label>
          <label className="radio-option">
            <input type="radio" name="recaptcha" value="disabled" checked={!s.recaptchaEnabled} onChange={() => set("recaptchaEnabled", false)} />
            <span className="radio-option-label">Disabled</span>
          </label>
        </div>
      </FieldRow>

      <FieldRow icon={<Icon.Globe size={14} />} label="Whitelisted Domains" hint="Leave empty to allow all domains">
        <textarea
          className="textarea"
          value={s.whitelistedDomains}
          onChange={e => set("whitelistedDomains", e.target.value)}
          placeholder="example.com&#10;app.example.com"
          rows={3}
          style={!s.whitelistedDomains ? { borderColor: "var(--yellow-border)" } : {}}
        />
        {!s.whitelistedDomains && (
          <div style={{ fontSize: 11, color: "var(--yellow)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <Icon.AlertTriangle size={11} />
            Without a whitelist, your agent is accessible from any domain
          </div>
        )}
      </FieldRow>

      <FieldRow icon={<Icon.Settings />} label="Conversation Retention Period">
        <div className="radio-group">
          {([
            ["custom", "Custom (in days)"],
            ["12months", "12 months"],
            ["never", "Never — conversations are not stored"],
          ] as [RetentionPeriod, string][]).map(([v, l]) => (
            <label key={v} className="radio-option">
              <input type="radio" name="retention" value={v} checked={s.conversationRetention === v} onChange={() => set("conversationRetention", v)} />
              <span className="radio-option-label">
                {l}
                {v === "never" && <small style={{ color: "var(--green)" }}>Recommended for privacy compliance</small>}
              </span>
            </label>
          ))}
        </div>
        {s.conversationRetention === "custom" && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              className="input"
              value={s.retentionDays}
              onChange={e => set("retentionDays", parseInt(e.target.value))}
              min={1}
              style={{ width: 100 }}
            />
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>days</span>
          </div>
        )}
      </FieldRow>
    </div>
  );
}

// ─── Placeholder Tab ──────────────────────────────────────────────────────────

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="coming-soon-tab">
      <div className="coming-soon-icon">
        <Icon.Rocket size={22} />
      </div>
      <div className="coming-soon-title">{title} — Coming soon</div>
      <div className="coming-soon-desc">{description}</div>
    </div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanel({ s }: { s: Settings }) {
  const borderRadius = { sharp: "0px", soft: "12px", round: "20px" };
  const radius = borderRadius[s.agentStyle];
  const fontStyle = s.fontFamily === "public-sans"
    ? "'Public Sans', sans-serif"
    : "'Inter', sans-serif";

  return (
    <div className="preview-card" style={{ fontFamily: fontStyle }}>
      <div className="preview-toolbar">
        <div className="preview-dots">
          <div className="preview-dot" style={{ background: "#ff5f57" }} />
          <div className="preview-dot" style={{ background: "#ffbd2e" }} />
          <div className="preview-dot" style={{ background: "#28c840" }} />
        </div>
        <span className="preview-label">Live Preview</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="preview-action-btn" title="Share"><Icon.Globe size={13} /></button>
          <button className="preview-action-btn" title="Expand"><Icon.Settings /></button>
        </div>
      </div>

      <div className="chat-widget">
        <div
          className="chat-header"
          style={{
            background: `linear-gradient(145deg, ${s.agentColor} 0%, ${s.agentColor}dd 100%)`,
            borderRadius: `0 0 0 0`,
          }}
        >
          {s.titleAvatarEnabled && (
            <div className="chat-header-avatar">
              {s.avatarInitials}
            </div>
          )}
          <div className="chat-header-title" style={{ color: s.titleColor }}>
            {s.agentTitle || s.agentName || "My Agent"}
          </div>
        </div>

        <div className="chat-body">
          {s.starterQuestionsEnabled && s.starterQuestions.length > 0 && (
            <div className="starter-q-preview-wrap">
              <div className="starter-q-preview-header">
                {s.starterQuestionsHeader || s.agentName}
              </div>
              {s.starterQuestions.slice(0, 3).map((q, i) => (
                <div key={i} className="starter-q-preview-item" style={{ borderRadius: radius }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${s.agentColor}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon.Chat />
                  </div>
                  {q}
                </div>
              ))}
            </div>
          )}

          {(!s.starterQuestionsEnabled || s.starterQuestions.length === 0) && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "var(--text-gray)", fontSize: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${s.agentColor}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <Icon.Chat />
                </div>
                Ready to chat
              </div>
            </div>
          )}
        </div>

        <div className="chat-footer">
          <div className="chat-input-preview" style={{ borderRadius: radius }}>
            <span className="chat-input-preview-text">
              {s.placeholderPrompt || "Ask me anything..."}
            </span>
            <div
              className="chat-send-btn"
              style={{ background: s.agentColor, color: "#fff", borderRadius: `calc(${radius} - 4px)` }}
            >
              <Icon.Send size={12} />
            </div>
          </div>
          {!s.removeBranding && (
            <div style={{ textAlign: "center", fontSize: 10, color: "var(--text-gray)", marginTop: 6 }}>
              Powered by CustomGPT.ai
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Publish Modal ────────────────────────────────────────────────────────────

function PublishModal({ s, onClose, onPublish }: {
  s: Settings;
  onClose: () => void;
  onPublish: () => void;
}) {
  const checks = [
    {
      label: "Agent Language",
      value: s.agentLanguage ? LANGUAGES.find(l => l.v === s.agentLanguage)?.l || s.agentLanguage : "Not set — defaults to English",
      ok: !!s.agentLanguage,
    },
    {
      label: "Agent Visibility",
      value: s.agentVisibility === "public" ? "Public — accessible to anyone" : "Private",
      ok: true,
    },
    {
      label: "Anti-Hallucination",
      value: s.antiHallucination ? "Enabled" : "Disabled (not recommended)",
      ok: s.antiHallucination,
    },
    {
      label: "Whitelisted Domains",
      value: s.whitelistedDomains || "None — accessible from any domain",
      ok: !!s.whitelistedDomains,
    },
    {
      label: "Conversation Retention",
      value: s.conversationRetention === "never" ? "Never stored" : s.conversationRetention === "12months" ? "12 months" : `${s.retentionDays} days`,
      ok: true,
    },
    {
      label: "Starter Questions",
      value: s.starterQuestionsEnabled && s.starterQuestions.length > 0
        ? `${s.starterQuestions.length} question(s) configured`
        : "Not configured",
      ok: s.starterQuestionsEnabled && s.starterQuestions.length > 0,
    },
  ];

  const warnings = checks.filter(c => !c.ok).length;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">Ready to publish?</div>
          <div className="modal-subtitle">
            {warnings > 0
              ? `${warnings} item${warnings > 1 ? "s" : ""} need your attention`
              : "All settings look good — your agent is ready to go live"}
          </div>
        </div>
        <div className="modal-body">
          <div className="config-check-list">
            {checks.map((c, i) => (
              <div key={i} className={`config-check-item ${c.ok ? "ok" : "warn"}`}>
                <div className="config-check-icon">
                  {c.ok
                    ? <span style={{ color: "var(--green)" }}><Icon.Check size={16} /></span>
                    : <span style={{ color: "var(--yellow)" }}><Icon.AlertTriangle size={16} /></span>
                  }
                </div>
                <div>
                  <div className="config-check-label">{c.label}</div>
                  <div className="config-check-value">{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="publish-btn" onClick={onPublish}>
            <Icon.Rocket size={14} />
            Publish Agent
          </button>
        </div>
      </div>
    </div>
  );
}

const LANGUAGES = [
  { v: "en", l: "English" }, { v: "es", l: "Spanish" }, { v: "fr", l: "French" },
  { v: "de", l: "German" }, { v: "it", l: "Italian" }, { v: "pt", l: "Portuguese" },
  { v: "sr", l: "Serbian (Latin)" }, { v: "sr-cyrl", l: "Serbian (Cyrillic)" },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar() {
  const icons = [
    { icon: <Icon.Plus size={18} />, active: false },
    { icon: <Icon.Settings />, active: false },
    { icon: <Icon.Brain />, active: true },
    { icon: <Icon.Chat />, active: false },
    { icon: <Icon.Quote />, active: false },
    { icon: <Icon.Shield />, active: false },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.3"/>
          <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      {icons.map((item, i) => (
        <div key={i} className={`sidebar-icon ${item.active ? "active" : ""}`}>
          {item.icon}
        </div>
      ))}
      <div style={{ marginTop: "auto" }}>
        <div className="sidebar-icon">
          <Icon.User />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "general", label: "General", icon: <Icon.Settings /> },
  { id: "persona", label: "Persona", icon: <Icon.User />, stub: true },
  { id: "conversation", label: "Conversation", icon: <Icon.Chat /> },
  { id: "citations", label: "Citations", icon: <Icon.Quote /> },
  { id: "intelligence", label: "Intelligence", icon: <Icon.Brain />, stub: true },
  { id: "advanced", label: "Advanced", icon: <Icon.Sliders /> },
  { id: "security", label: "Security", icon: <Icon.Shield /> },
];

const ACTIVE_TABS = TABS.filter(t => !t.stub).map(t => t.id);

export default function PersonalizePage() {
  const [activeTab, setActiveTab] = useState("general");
  const [draft, setDraft] = useState<Settings>({ ...DEFAULTS });
  const [saved, setSaved] = useState<Settings>({ ...DEFAULTS });
  const [savedTabs, setSavedTabs] = useState<Set<string>>(new Set());
  const [dirtyTabs, setDirtyTabs] = useState<Set<string>>(new Set());
  const [showPublish, setShowPublish] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = dirtyTabs.has(activeTab);

  const set = useCallback((k: keyof Settings, v: unknown) => {
    setDraft(prev => ({ ...prev, [k]: v }));
    setDirtyTabs(prev => new Set([...prev, activeTab]));
  }, [activeTab]);

  const handleSave = useCallback(() => {
    setSaved({ ...draft });
    setSavedTabs(prev => new Set([...prev, activeTab]));
    setDirtyTabs(prev => { const n = new Set(prev); n.delete(activeTab); return n; });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast("Settings saved");
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, [draft, activeTab]);

  const handlePublish = useCallback(() => {
    handleSave();
    setShowPublish(false);
    setPublished(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast("Agent is now live!");
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, [handleSave]);

  const progress = Math.round((savedTabs.size / ACTIVE_TABS.length) * 100);
  const savedCount = savedTabs.size;

  const agentLabel = draft.agentName || "My Agent";

  return (
    <>
      <Sidebar />

      <div className="main-wrap">
        {/* Header */}
        <div className="page-header">
          <div className="page-title-row">
            <div>
              <div className="page-title">Personalize &bull; {agentLabel}</div>
              <div className="page-subtitle">Settings here apply to all deployment options.</div>
            </div>
            <button
              className="publish-btn"
              onClick={() => setShowPublish(true)}
            >
              <Icon.Rocket size={14} />
              {published ? "Published" : "Publish"}
              {savedCount < ACTIVE_TABS.length && (
                <span className="publish-badge">{savedCount}/{ACTIVE_TABS.length}</span>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="tab-nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""} ${tab.stub ? "stub" : ""}`}
                onClick={() => !tab.stub && setActiveTab(tab.id)}
              >
                {tab.label}
                {!tab.stub && dirtyTabs.has(tab.id) && <span className="tab-dot" />}
                {!tab.stub && savedTabs.has(tab.id) && !dirtyTabs.has(tab.id) && (
                  <span className="tab-check">
                    <Icon.Check size={8} />
                  </span>
                )}
                {tab.stub && <span className="badge badge-gray" style={{ fontSize: 9, padding: "1px 5px" }}>Soon</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-wrap">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">
            {savedCount} of {ACTIVE_TABS.length} sections configured
          </span>
        </div>

        {/* Two-column layout */}
        <div className="two-col">
          <div className="form-col">
            {activeTab === "general" && <GeneralTab s={draft} set={set} />}
            {activeTab === "persona" && (
              <PlaceholderTab
                title="Persona"
                description="Define your agent's personality, tone, and behavioral guidelines."
              />
            )}
            {activeTab === "conversation" && <ConversationTab s={draft} set={set} />}
            {activeTab === "citations" && <CitationsTab s={draft} set={set} />}
            {activeTab === "intelligence" && (
              <PlaceholderTab
                title="Intelligence"
                description="Configure AI model, data sources, and reasoning capabilities."
              />
            )}
            {activeTab === "advanced" && <AdvancedTab s={draft} set={set} />}
            {activeTab === "security" && <SecurityTab s={draft} set={set} />}
          </div>

          <div className="preview-col">
            <PreviewPanel s={draft} />
          </div>
        </div>

        {/* Sticky Save Bar */}
        {!TABS.find(t => t.id === activeTab)?.stub && (
          <div className="save-bar">
            <div className="save-bar-status">
              {isDirty ? (
                <>
                  <span className="save-bar-dot" />
                  Unsaved changes in {TABS.find(t => t.id === activeTab)?.label}
                </>
              ) : (
                <span className="save-bar-saved">
                  <Icon.Check size={14} />
                  All changes saved
                </span>
              )}
            </div>
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={!isDirty}
            >
              Save Settings
            </button>
          </div>
        )}
      </div>

      {/* Publish Modal */}
      {showPublish && (
        <PublishModal
          s={draft}
          onClose={() => setShowPublish(false)}
          onPublish={handlePublish}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast toast-success">
          <Icon.Check size={14} />
          {toast}
        </div>
      )}
    </>
  );
}
