"use client";

import React, { useState, useCallback, useRef } from "react";
import StarterQuestions from "@/components/StarterQuestions";

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
  agentColor: "#7367F0",
  agentStyle: "soft",
  fontFamily: "inter",
  backgroundType: "color",
  backgroundColor: "#7367F0",
  iDontKnowMessage: "I'm sorry, I don't have information about that. Please try rephrasing your question.",
  starterQuestionsEnabled: false,
  starterQuestions: [],
  starterQuestionsHeader: "My Agent",
  starterQuestionsExpand: "Show more",
  starterQuestionsCollapse: "Show less",
  agentLanguage: "en",
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

const LANGUAGES = [
  { v: "", l: "Select language…", flag: "" },
  { v: "en", l: "English", flag: "🇬🇧" },
  { v: "es", l: "Spanish", flag: "🇪🇸" },
  { v: "fr", l: "French", flag: "🇫🇷" },
  { v: "de", l: "German", flag: "🇩🇪" },
  { v: "it", l: "Italian", flag: "🇮🇹" },
  { v: "pt", l: "Portuguese", flag: "🇵🇹" },
  { v: "nl", l: "Dutch", flag: "🇳🇱" },
  { v: "pl", l: "Polish", flag: "🇵🇱" },
  { v: "ru", l: "Russian", flag: "🇷🇺" },
  { v: "sr", l: "Serbian (Latin)", flag: "🇷🇸" },
  { v: "sr-cyrl", l: "Serbian (Cyrillic)", flag: "🇷🇸" },
  { v: "ar", l: "Arabic", flag: "🇸🇦" },
  { v: "zh", l: "Chinese (Simplified)", flag: "🇨🇳" },
  { v: "ja", l: "Japanese", flag: "🇯🇵" },
  { v: "ko", l: "Korean", flag: "🇰🇷" },
  { v: "tr", l: "Turkish", flag: "🇹🇷" },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="cg-toggle-wrap">
      <div className="cg-toggle">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className="cg-toggle-track" />
        <div className="cg-toggle-thumb" />
      </div>
      <span className={`cg-toggle-label ${checked ? "on" : ""}`}>{checked ? "Enabled" : "Disabled"}</span>
    </label>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="cg-accordion">
      <button className="cg-accordion-header" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <i className={`ti ti-chevron-${open ? "up" : "down"}`} style={{ fontSize: 16 }} />
      </button>
      {open && <div className="cg-accordion-body">{children}</div>}
    </div>
  );
}

function FieldRow({ icon, label, hint, children }: {
  icon: string; label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="field-row">
      <div className="field-label-col">
        <i className={`ti ti-${icon} field-icon`} />
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
  const STYLE_RADIUS: Record<AgentStyle, string> = { sharp: "0px", soft: "8px", round: "20px" };

  return (
    <>
      <div className="identity-card">
        <FieldRow icon="text-size" label="Agent name">
          <input
            className="cg-input"
            value={s.agentName}
            onChange={e => {
              const v = e.target.value;
              set("agentName", v);
              const initials = v.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
              set("avatarInitials", initials);
              if (!s.agentTitle || s.agentTitle === s.agentName) set("agentTitle", v);
            }}
            placeholder="e.g. Support Bot, Sales Assistant"
          />
        </FieldRow>

        <FieldRow icon="robot" label="Agent role">
          <select className="cg-select" value={s.agentRole} onChange={e => set("agentRole", e.target.value)}>
            <option value="enterprise-search">Enterprise Search</option>
            <option value="customer-support">Customer Support</option>
            <option value="lead-generation">Lead Generation</option>
            <option value="knowledge-base">Knowledge Base</option>
            <option value="general">General Assistant</option>
          </select>
          <div style={{ marginTop: 6 }}>
            <a href="#" className="helper-link">Learn more <i className="ti ti-arrow-up-right" style={{ fontSize: 11 }} /></a>
          </div>
        </FieldRow>

        <FieldRow icon="photo" label="Agent avatar" hint="JPG, GIF or PNG · max 800 KB · square recommended">
          <div className="avatar-zone">
            <div className="avatar-preview" style={{ background: s.agentColor }}>
              {s.avatarInitials}
            </div>
            <div>
              <button className="cg-btn cg-btn-neutral cg-btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <i className="ti ti-upload" style={{ fontSize: 14 }} />
                Change avatar
              </button>
              <div className="helper-text">Upload a square image only</div>
            </div>
          </div>
        </FieldRow>
      </div>

      <p className="card-label">Appearance</p>
      <div className="settings-card">
        <FieldRow icon="palette" label="Color scheme">
          <div className="radio-group">
            {(["adaptive", "legacy"] as ColorScheme[]).map(v => (
              <label key={v} className="radio-opt">
                <input type="radio" name="colorScheme" value={v} checked={s.colorScheme === v} onChange={() => set("colorScheme", v)} />
                <span className="radio-opt-label">
                  {v === "adaptive" ? "Adaptive" : "Legacy"}
                  <small>{v === "adaptive" ? "Follows the user's dark / light mode" : "Always shows your primary color"}</small>
                </span>
              </label>
            ))}
          </div>
        </FieldRow>

        <FieldRow icon="color-swatch" label="Primary color">
          <div className="color-row">
            <input
              type="color"
              className="color-swatch"
              value={s.agentColor}
              onChange={e => { set("agentColor", e.target.value); set("backgroundColor", e.target.value); }}
            />
            <input
              className="cg-input"
              value={s.agentColor}
              onChange={e => { set("agentColor", e.target.value); set("backgroundColor", e.target.value); }}
              placeholder="#7367F0"
              style={{ maxWidth: 140 }}
            />
          </div>
        </FieldRow>

        <FieldRow icon="layout-2" label="Agent style">
          <div className="style-options">
            {(["sharp", "soft", "round"] as AgentStyle[]).map(style => (
              <div key={style} className={`style-option ${s.agentStyle === style ? "selected" : ""}`} onClick={() => set("agentStyle", style)}>
                <div className="style-preview-bubble" style={{ borderRadius: STYLE_RADIUS[style] }} />
                <span className="style-option-label">{style.charAt(0).toUpperCase() + style.slice(1)}</span>
              </div>
            ))}
          </div>
        </FieldRow>

        <FieldRow icon="typography" label="Font family">
          <div className="radio-group">
            {(["inter", "public-sans"] as FontFamily[]).map(v => (
              <label key={v} className="radio-opt">
                <input type="radio" name="fontFamily" value={v} checked={s.fontFamily === v} onChange={() => set("fontFamily", v)} />
                <span className="radio-opt-label">{v === "inter" ? "Inter" : "Public Sans"}</span>
              </label>
            ))}
          </div>
        </FieldRow>

        <FieldRow icon="background" label="Background">
          <div className="radio-group">
            <label className="radio-opt">
              <input type="radio" name="bgType" value="image" checked={s.backgroundType === "image"} onChange={() => set("backgroundType", "image")} />
              <span className="radio-opt-label">Background image</span>
            </label>
            <label className="radio-opt">
              <input type="radio" name="bgType" value="color" checked={s.backgroundType === "color"} onChange={() => set("backgroundType", "color")} />
              <span className="radio-opt-label">Background color</span>
            </label>
          </div>
          {s.backgroundType === "color" && (
            <div className="color-row" style={{ marginTop: 10 }}>
              <input type="color" className="color-swatch" value={s.backgroundColor} onChange={e => set("backgroundColor", e.target.value)} />
              <input className="cg-input" value={s.backgroundColor} onChange={e => set("backgroundColor", e.target.value)} style={{ maxWidth: 140 }} />
            </div>
          )}
        </FieldRow>
      </div>
    </>
  );
}

// ─── Conversation Tab ─────────────────────────────────────────────────────────

function ConversationTab({ s, set }: { s: Settings; set: (k: keyof Settings, v: unknown) => void }) {
  return (
    <>
      <p className="card-label">Language</p>
      <div className="settings-card">
        {!s.agentLanguage && (
          <div className="cg-alert cg-alert-warning" style={{ margin: "12px 0 4px" }}>
            <i className="ti ti-alert-triangle" />
            <span>Agent language is not set — your agent will respond in English by default.</span>
          </div>
        )}
        <FieldRow icon="language" label="Agent language" hint="Language your agent uses for all responses">
          <select
            className={`cg-select ${!s.agentLanguage ? "warn" : ""}`}
            value={s.agentLanguage}
            onChange={e => set("agentLanguage", e.target.value)}
          >
            {LANGUAGES.map(l => <option key={l.v} value={l.v}>{l.flag ? `${l.flag} ${l.l}` : l.l}</option>)}
          </select>
          {s.agentLanguage && (
            <div style={{ marginTop: 6 }}>
              <span className="cg-badge cg-badge-success">
                <i className="ti ti-check" style={{ fontSize: 11 }} />
                Language set
              </span>
            </div>
          )}
        </FieldRow>
      </div>

      <p className="card-label">Starter questions</p>
      <StarterQuestions
        tier="enterprise"
        initialQuestions={s.starterQuestions}
        onChange={questions => {
          set("starterQuestions", questions);
          set("starterQuestionsEnabled", questions.length > 0);
        }}
      />

      {s.starterQuestionsEnabled && (
        <div className="settings-card" style={{ marginTop: 8 }}>
          <FieldRow icon="heading" label="Header text">
            <input className="cg-input" value={s.starterQuestionsHeader} onChange={e => set("starterQuestionsHeader", e.target.value)} />
          </FieldRow>
          <FieldRow icon="chevron-down" label="Expand label">
            <input className="cg-input" value={s.starterQuestionsExpand} onChange={e => set("starterQuestionsExpand", e.target.value)} placeholder="Show more" />
          </FieldRow>
          <FieldRow icon="chevron-up" label="Collapse label">
            <input className="cg-input" value={s.starterQuestionsCollapse} onChange={e => set("starterQuestionsCollapse", e.target.value)} placeholder="Show less" />
          </FieldRow>
        </div>
      )}

      <p className="card-label">Chat interface</p>
      <div className="settings-card">
        <FieldRow icon="cursor-text" label="Placeholder prompt">
          <input className="cg-input" value={s.placeholderPrompt} onChange={e => set("placeholderPrompt", e.target.value)} placeholder="Ask me anything…" />
        </FieldRow>
        <FieldRow icon="loader-2" label="Loading indicator">
          <div className="radio-group">
            <label className="radio-opt">
              <input type="radio" name="loading" value="typing" checked={s.loadingIndicator === "typing"} onChange={() => set("loadingIndicator", "typing")} />
              <span className="radio-opt-label">Typing dot animation</span>
            </label>
            <label className="radio-opt">
              <input type="radio" name="loading" value="spinner" checked={s.loadingIndicator === "spinner"} onChange={() => set("loadingIndicator", "spinner")} />
              <span className="radio-opt-label">Spinner</span>
            </label>
          </div>
        </FieldRow>
        <FieldRow icon="markdown" label="Markdown in responses">
          <Toggle checked={s.markdownInResponses} onChange={v => set("markdownInResponses", v)} />
        </FieldRow>
      </div>

      <p className="card-label">System messages</p>
      <div className="settings-card">
        <FieldRow icon="help-circle" label="I don&apos;t know message" hint="Shown when the agent can't answer">
          <textarea className="cg-textarea" value={s.iDontKnowMessage} onChange={e => set("iDontKnowMessage", e.target.value)} rows={3} />
        </FieldRow>
        <FieldRow icon="message-2-plus" label="Custom message ending">
          <input className="cg-input" value={s.customMessageEnding} onChange={e => set("customMessageEnding", e.target.value)} placeholder="Optional text appended to all responses" />
        </FieldRow>
        <FieldRow icon="alert-circle" label="Error message">
          <input className="cg-input" value={s.errorMessage} onChange={e => set("errorMessage", e.target.value)} />
        </FieldRow>
        <FieldRow icon="shield-x" label="Failed moderation message">
          <input className="cg-input" value={s.failedModerationMessage} onChange={e => set("failedModerationMessage", e.target.value)} />
        </FieldRow>
      </div>

      <p className="card-label">Memory</p>
      <div className="settings-card">
        <FieldRow icon="clock" label="Conversation duration">
          <div className="radio-group">
            {([
              ["unlimited", "Unlimited", "Conversation context has no time limit"],
              ["24h", "24-hour memory limit", "Context resets after 24 hours of inactivity"],
              ["session", "Session only", "Context resets when the browser is closed"],
            ] as [ConversationDuration, string, string][]).map(([v, l, d]) => (
              <label key={v} className="radio-opt">
                <input type="radio" name="duration" value={v} checked={s.conversationDuration === v} onChange={() => set("conversationDuration", v)} />
                <span className="radio-opt-label">{l}<small>{d}</small></span>
              </label>
            ))}
          </div>
        </FieldRow>
      </div>
    </>
  );
}

// ─── Citations Tab ────────────────────────────────────────────────────────────

function CitationsTab({ s, set }: { s: Settings; set: (k: keyof Settings, v: unknown) => void }) {
  return (
    <>
      <p className="card-label">Citations</p>
      <div className="settings-card">
        <FieldRow icon="quote" label="Enable citations" hint="Show source references in responses">
          <Toggle checked={s.enableCitations} onChange={v => set("enableCitations", v)} />
        </FieldRow>
      </div>

      {s.enableCitations && (
        <>
          <p className="card-label">Citation types</p>
          <div className="settings-card">
            <FieldRow icon="list-numbers" label="Numbered references" hint="Inline numbered citations in response text">
              <Toggle checked={s.numberedReferences} onChange={v => set("numberedReferences", v)} />
            </FieldRow>
            <FieldRow icon="photo" label="Render image citations inline">
              <Toggle checked={s.renderImageCitationsInline} onChange={v => set("renderImageCitationsInline", v)} />
            </FieldRow>
            {s.renderImageCitationsInline && (
              <FieldRow icon="arrows-vertical" label="Load image height">
                <Toggle checked={s.loadImageHeight} onChange={v => set("loadImageHeight", v)} />
              </FieldRow>
            )}
            <FieldRow icon="world" label="OpenGraph images for web pages">
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Toggle checked={s.useOpenGraphImages} onChange={v => set("useOpenGraphImages", v)} />
                <span className="cg-badge cg-badge-primary">Beta</span>
              </div>
              <div className="helper-text">Display the page&apos;s preview image instead of a text citation</div>
            </FieldRow>
            <FieldRow icon="photo-scan" label="Max images per response">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["1", "2", "3", "4", "5", "unlimited"].map(v => (
                  <label key={v} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                    <input type="radio" name="maxImages" value={v} checked={s.maxImagesPerResponse === v} onChange={() => set("maxImagesPerResponse", v)} style={{ accentColor: "var(--cg-primary)" }} />
                    <span style={{ font: "400 13px/18px var(--cg-font)", color: "var(--cg-fg-2)" }}>{v === "unlimited" ? "Unlimited" : v}</span>
                  </label>
                ))}
              </div>
            </FieldRow>
          </div>

          <p className="card-label">Classic citations</p>
          <div className="settings-card">
            <FieldRow icon="heading" label="Section header">
              <input className="cg-input" value={s.afterResponseHeader} onChange={e => set("afterResponseHeader", e.target.value)} placeholder="Where did this answer come from?" />
            </FieldRow>
            <FieldRow icon="tag" label="Source label">
              <input className="cg-input" value={s.afterResponseSource} onChange={e => set("afterResponseSource", e.target.value)} placeholder="Source" />
            </FieldRow>
            <FieldRow icon="layout-bottombar" label="Show source view">
              <select className="cg-select" value={s.showSourceView} onChange={e => set("showSourceView", e.target.value as SourceView)}>
                <option value="opened">Opened</option>
                <option value="collapsed">Collapsed</option>
              </select>
            </FieldRow>
          </div>

          <p className="card-label">PDF citations</p>
          <div className="settings-card">
            <FieldRow icon="file-type-pdf" label="Enable PDF viewer">
              <Toggle checked={s.enablePDFViewer} onChange={v => set("enablePDFViewer", v)} />
            </FieldRow>
            {s.enablePDFViewer && (
              <>
                <FieldRow icon="file-search" label="Auto-open PDF viewer">
                  <Toggle checked={s.autoOpenPDFViewer} onChange={v => set("autoOpenPDFViewer", v)} />
                </FieldRow>
                <FieldRow icon="file-download-off" label="Prevent PDF download">
                  <Toggle checked={s.preventPDFDownload} onChange={v => set("preventPDFDownload", v)} />
                </FieldRow>
              </>
            )}
          </div>

          <p className="card-label">Advanced</p>
          <div className="settings-card">
            <Accordion title="Knowledge base settings">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {([
                  ["knowledgeBaseAwareness", "Knowledge base awareness", "Agent can describe what sources and files it has access to"],
                  ["allowKnowledgeBaseQueries", "Allow knowledge base queries", "Users can ask what sources the agent uses"],
                  ["numericSearchOptimization", "Numeric search optimization", "Better results when querying for product codes, SKUs, or reference numbers"],
                  ["enableNumericSearch", "Enable numeric search", "More accurate matching on part numbers and alphanumeric codes"],
                ] as [keyof Settings, string, string][]).map(([key, label, desc]) => (
                  <div key={key}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ font: "500 13px/18px var(--cg-font)", color: "var(--cg-fg-1)" }}>{label}</span>
                      <Toggle checked={s[key] as boolean} onChange={v => set(key, v)} />
                    </div>
                    <div className="helper-text">{desc}</div>
                  </div>
                ))}
              </div>
            </Accordion>
          </div>
        </>
      )}
    </>
  );
}

// ─── Advanced Tab ─────────────────────────────────────────────────────────────

function AdvancedTab({ s, set }: { s: Settings; set: (k: keyof Settings, v: unknown) => void }) {
  return (
    <>
      <p className="card-label">User engagement</p>
      <div className="settings-card">
        <FieldRow icon="history" label="Conversation history" hint="Users can resume past conversations">
          <Toggle checked={s.conversationHistoryEnabled} onChange={v => set("conversationHistoryEnabled", v)} />
          {s.conversationHistoryEnabled && (
            <div className="sub-section" style={{ marginTop: 12 }}>
              <div className="helper-text" style={{ marginBottom: 8 }}>Show history across:</div>
              <div className="radio-group">
                {["Everyone", "Team members only", "Others (guests)"].map(opt => (
                  <label key={opt} className="radio-opt">
                    <input type="radio" name="historyScope" value={opt} defaultChecked={opt === "Everyone"} />
                    <span className="radio-opt-label">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </FieldRow>
        <FieldRow icon="thumb-up" label="User feedback">
          <Toggle checked={s.userFeedback} onChange={v => set("userFeedback", v)} />
        </FieldRow>
        <FieldRow icon="copy" label="Show copy button">
          <Toggle checked={s.showCopyButton} onChange={v => set("showCopyButton", v)} />
        </FieldRow>
        <FieldRow icon="share-2" label="Conversation sharing">
          <Toggle checked={s.conversationSharing} onChange={v => set("conversationSharing", v)} />
        </FieldRow>
        <FieldRow icon="file-export" label="Conversation exporting">
          <Toggle checked={s.conversationExporting} onChange={v => set("conversationExporting", v)} />
        </FieldRow>
      </div>

      <p className="card-label">Branding</p>
      <div className="settings-card">
        <FieldRow icon="brand-google" label="Remove branding">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ font: "400 12px/16px var(--cg-font)", color: "var(--cg-fg-3)" }}>Powered by CustomGPT.ai</span>
            <Toggle checked={s.removeBranding} onChange={v => set("removeBranding", v)} />
          </div>
        </FieldRow>
        <FieldRow icon="text-size" label="Agent title">
          <input className="cg-input" value={s.agentTitle} onChange={e => set("agentTitle", e.target.value)} />
        </FieldRow>
        <FieldRow icon="color-swatch" label="Title color">
          <div className="color-row">
            <input type="color" className="color-swatch" value={s.titleColor} onChange={e => set("titleColor", e.target.value)} />
            <input className="cg-input" value={s.titleColor} onChange={e => set("titleColor", e.target.value)} style={{ maxWidth: 140 }} />
          </div>
        </FieldRow>
      </div>

      <p className="card-label">Avatars</p>
      <div className="settings-card">
        <FieldRow icon="user-circle" label="Title avatar">
          <Toggle checked={s.titleAvatarEnabled} onChange={v => set("titleAvatarEnabled", v)} />
        </FieldRow>
        <FieldRow icon="user-star" label="Spotlight avatar">
          <Toggle checked={s.spotlightAvatarEnabled} onChange={v => set("spotlightAvatarEnabled", v)} />
          {s.spotlightAvatarEnabled && (
            <div className="radio-group" style={{ marginTop: 10 }}>
              {[["icon-space", "Use icon-space avatar"], ["agent-avatar", "Use item agent avatar"], ["round", "Round spotlight avatar shape"]].map(([v, l]) => (
                <label key={v} className="radio-opt">
                  <input type="radio" name="spotlightType" value={v} defaultChecked={v === "agent-avatar"} />
                  <span className="radio-opt-label">{l}</span>
                </label>
              ))}
            </div>
          )}
        </FieldRow>
        <FieldRow icon="user-circle" label="User avatar">
          <Toggle checked={s.userAvatarEnabled} onChange={v => set("userAvatarEnabled", v)} />
        </FieldRow>
        <FieldRow icon="layout-sidebar" label="Avatar orientation">
          <select className="cg-select" value={s.avatarOrientation} onChange={e => set("avatarOrientation", e.target.value)}>
            <option value="agent-left-user-right">Agent left, user right</option>
            <option value="agent-right-user-left">Agent right, user left</option>
          </select>
        </FieldRow>
        <FieldRow icon="align-left" label="Title & avatar alignment">
          <select className="cg-select" value={s.agentTitleAlignment} onChange={e => set("agentTitleAlignment", e.target.value)}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </FieldRow>
        <FieldRow icon="message-circle-user" label="In-chat avatars">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["inChatAgentAvatar", "Agent avatar"] as [keyof Settings, string],
              ["inChatUserAvatar", "User avatar"] as [keyof Settings, string],
            ].map(([key, label]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ font: "400 13px/18px var(--cg-font)", color: "var(--cg-fg-2)" }}>{label}</span>
                <Toggle checked={s[key] as boolean} onChange={v => set(key, v)} />
              </div>
            ))}
          </div>
        </FieldRow>
      </div>

      <p className="card-label">Legal</p>
      <div className="settings-card">
        <FieldRow icon="file-text" label="Terms of service">
          <textarea className="cg-textarea" value={s.termsOfService} onChange={e => set("termsOfService", e.target.value)} placeholder="Enter your terms of service text here…" rows={3} />
        </FieldRow>
      </div>
    </>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab({ s, set }: { s: Settings; set: (k: keyof Settings, v: unknown) => void }) {
  return (
    <>
      <p className="card-label">Content safety</p>
      <div className="settings-card">
        <FieldRow icon="brain" label="Anti-hallucination" hint="Prevents the agent from generating unsupported content">
          <div className="radio-group">
            <label className="radio-opt">
              <input type="radio" name="antiH" value="enabled" checked={s.antiHallucination} onChange={() => set("antiHallucination", true)} />
              <span className="radio-opt-label">Enabled</span>
            </label>
            <label className="radio-opt">
              <input type="radio" name="antiH" value="disabled" checked={!s.antiHallucination} onChange={() => set("antiHallucination", false)} />
              <span className="radio-opt-label">
                Disabled
                <small style={{ color: "var(--cg-danger)" }}>Not recommended for production agents</small>
              </span>
            </label>
          </div>
        </FieldRow>
      </div>

      <p className="card-label">Access control</p>
      <div className="settings-card">
        <FieldRow icon="eye" label="Agent visibility">
          <div className="radio-group">
            <label className="radio-opt">
              <input type="radio" name="visibility" value="private" checked={s.agentVisibility === "private"} onChange={() => set("agentVisibility", "private")} />
              <span className="radio-opt-label">
                Private
                <small>Only accessible with a direct link or embed</small>
              </span>
            </label>
            <label className="radio-opt">
              <input type="radio" name="visibility" value="public" checked={s.agentVisibility === "public"} onChange={() => set("agentVisibility", "public")} />
              <span className="radio-opt-label">
                Public
                <small>Anyone can find and interact with your agent</small>
              </span>
            </label>
          </div>
        </FieldRow>
        <FieldRow icon="robot" label="Recaptcha">
          <div className="radio-group">
            <label className="radio-opt">
              <input type="radio" name="recaptcha" value="enabled" checked={s.recaptchaEnabled} onChange={() => set("recaptchaEnabled", true)} />
              <span className="radio-opt-label">Enabled</span>
            </label>
            <label className="radio-opt">
              <input type="radio" name="recaptcha" value="disabled" checked={!s.recaptchaEnabled} onChange={() => set("recaptchaEnabled", false)} />
              <span className="radio-opt-label">Disabled</span>
            </label>
          </div>
        </FieldRow>
        <FieldRow icon="world" label="Whitelisted domains" hint="Leave empty to allow all domains">
          <textarea
            className={`cg-textarea ${!s.whitelistedDomains ? "warn" : ""}`}
            value={s.whitelistedDomains}
            onChange={e => set("whitelistedDomains", e.target.value)}
            placeholder={"example.com\napp.example.com"}
            rows={3}
          />
          {!s.whitelistedDomains && (
            <div className="helper-warn">
              <i className="ti ti-alert-triangle" style={{ fontSize: 12 }} />
              Without a whitelist, your agent is accessible from any domain
            </div>
          )}
        </FieldRow>
      </div>

      <p className="card-label">Data & privacy</p>
      <div className="settings-card">
        <FieldRow icon="shield-check" label="Data protection">
          <div className="cg-alert cg-alert-info" style={{ marginBottom: 0 }}>
            <i className="ti ti-info-circle" />
            <span>
              CustomGPT.ai is SOC 2 Type II certified and fully GDPR compliant. Your data and your users&apos; data are safe with us.{" "}
              <a href="#" className="helper-link">Trust Center <i className="ti ti-arrow-up-right" style={{ fontSize: 10 }} /></a>
            </span>
          </div>
        </FieldRow>
        <FieldRow icon="calendar-time" label="Conversation retention">
          <div className="radio-group">
            {([
              ["custom", "Custom (in days)"],
              ["12months", "12 months"],
              ["never", "Never — conversations are not stored"],
            ] as [RetentionPeriod, string][]).map(([v, l]) => (
              <label key={v} className="radio-opt">
                <input type="radio" name="retention" value={v} checked={s.conversationRetention === v} onChange={() => set("conversationRetention", v)} />
                <span className="radio-opt-label">
                  {l}
                  {v === "never" && <small style={{ color: "var(--cg-success-700)" }}>Recommended for privacy compliance</small>}
                </span>
              </label>
            ))}
          </div>
          {s.conversationRetention === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <input type="number" className="cg-input" value={s.retentionDays} onChange={e => set("retentionDays", parseInt(e.target.value) || 30)} min={1} style={{ width: 100 }} />
              <span style={{ font: "400 13px/18px var(--cg-font)", color: "var(--cg-fg-3)" }}>days</span>
            </div>
          )}
        </FieldRow>
      </div>
    </>
  );
}

// ─── Placeholder Tab ──────────────────────────────────────────────────────────

function PlaceholderTab({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="coming-soon">
      <div className="coming-soon-icon"><i className="ti ti-rocket" /></div>
      <div className="coming-soon-title">{title} — coming soon</div>
      <div className="coming-soon-desc">{desc}</div>
    </div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanel({ s }: { s: Settings }) {
  const radius = { sharp: "0px", soft: "12px", round: "20px" }[s.agentStyle];

  return (
    <div className="preview-card">
      <div className="preview-toolbar">
        <div className="preview-dots">
          <div className="preview-dot" style={{ background: "#FF5F57" }} />
          <div className="preview-dot" style={{ background: "#FFBD2E" }} />
          <div className="preview-dot" style={{ background: "#28C840" }} />
        </div>
        <span className="preview-label">Live preview</span>
        <div style={{ display: "flex", gap: 2 }}>
          <button className="cg-btn cg-btn-ghost" style={{ padding: "4px 6px" }}>
            <i className="ti ti-arrows-maximize" style={{ fontSize: 13 }} />
          </button>
        </div>
      </div>

      <div className="chat-widget">
        <div className="chat-header" style={{ background: `linear-gradient(145deg, ${s.agentColor} 0%, ${s.agentColor}dd 100%)` }}>
          {s.titleAvatarEnabled && (
            <div className="chat-avatar">{s.avatarInitials}</div>
          )}
          <div className="chat-title" style={{ color: s.titleColor }}>
            {s.agentTitle || s.agentName || "My Agent"}
          </div>
        </div>

        <div className="chat-body">
          {s.starterQuestionsEnabled && s.starterQuestions.length > 0 ? (
            <div className="sq-preview-card">
              <div className="sq-preview-header">{s.starterQuestionsHeader || s.agentName}</div>
              {s.starterQuestions.slice(0, 3).map((q, i) => (
                <div key={i} className="sq-preview-item" style={{ borderRadius: radius }}>
                  <i className="ti ti-message-circle" style={{ fontSize: 13, color: s.agentColor, flexShrink: 0 }} />
                  {q}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "var(--cg-fg-4)", fontSize: 12 }}>
                <i className="ti ti-message-2" style={{ fontSize: 28, display: "block", marginBottom: 8, color: `${s.agentColor}40` }} />
                Ready to chat
              </div>
            </div>
          )}
        </div>

        <div className="chat-footer">
          <div className="chat-input-row" style={{ borderRadius: radius }}>
            <span className="chat-placeholder">{s.placeholderPrompt || "Ask me anything…"}</span>
            <div className="chat-send-btn" style={{ background: s.agentColor }}>
              <i className="ti ti-send" style={{ fontSize: 13 }} />
            </div>
          </div>
          {!s.removeBranding && (
            <div className="chat-branding">Powered by CustomGPT.ai</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Publish Modal ────────────────────────────────────────────────────────────

function PublishModal({ s, onClose, onPublish }: { s: Settings; onClose: () => void; onPublish: () => void }) {
  const checks = [
    { label: "Agent language", value: s.agentLanguage ? (() => { const lang = LANGUAGES.find(l => l.v === s.agentLanguage); return lang ? `${lang.flag} ${lang.l}` : s.agentLanguage; })() : "Not set — defaults to English", ok: !!s.agentLanguage },
    { label: "Agent visibility", value: s.agentVisibility === "public" ? "Public — accessible to anyone" : "Private", ok: true },
    { label: "Anti-hallucination", value: s.antiHallucination ? "Enabled" : "Disabled (not recommended)", ok: s.antiHallucination },
    { label: "Whitelisted domains", value: s.whitelistedDomains || "None — accessible from any domain", ok: !!s.whitelistedDomains },
    { label: "Conversation retention", value: s.conversationRetention === "never" ? "Never stored" : s.conversationRetention === "12months" ? "12 months" : `${s.retentionDays} days`, ok: true },
    { label: "Starter questions", value: s.starterQuestionsEnabled && s.starterQuestions.length > 0 ? `${s.starterQuestions.length} configured` : "Not configured", ok: s.starterQuestionsEnabled && s.starterQuestions.length > 0 },
  ];
  const warnings = checks.filter(c => !c.ok).length;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-hd">
          <div className="modal-title">Ready to publish?</div>
          <div className="modal-subtitle">
            {warnings > 0 ? `${warnings} item${warnings > 1 ? "s" : ""} need your attention` : "All settings look good — your agent is ready to go live"}
          </div>
        </div>
        <div className="modal-body">
          <div className="check-list">
            {checks.map((c, i) => (
              <div key={i} className={`check-item ${c.ok ? "ok" : "warn"}`}>
                <i className={`ti ti-${c.ok ? "circle-check" : "alert-triangle"} check-icon ${c.ok ? "ok" : "warn"}`} />
                <div>
                  <div className="check-label">{c.label}</div>
                  <div className="check-value">{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-ft">
          <button className="cg-btn cg-btn-neutral" onClick={onClose}>Cancel</button>
          <button className="cg-btn cg-btn-primary" onClick={onPublish}>
            <i className="ti ti-rocket" style={{ fontSize: 15 }} />
            Publish agent
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function AppSidebar() {
  const items = [
    { icon: "chart-donut", active: false },
    { icon: "robot", active: true },
    { icon: "messages", active: false },
    { icon: "books", active: false },
    { icon: "world", active: false },
    { icon: "users", active: false },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="CustomGPT" width={28} height={28} />
      </div>
      {items.map((item, i) => (
        <div key={i} className={`sidebar-item ${item.active ? "active" : ""}`}>
          <i className={`ti ti-${item.icon}`} style={{ fontSize: 20 }} />
        </div>
      ))}
      <div style={{ marginTop: "auto" }}>
        <div className="sidebar-item">
          <i className="ti ti-settings" style={{ fontSize: 20 }} />
        </div>
        <div className="sidebar-item">
          <i className="ti ti-user-circle" style={{ fontSize: 20 }} />
        </div>
      </div>
    </aside>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "general",       label: "General",       icon: "settings-2" },
  { id: "persona",       label: "Persona",       icon: "mood-smile",  stub: true },
  { id: "conversation",  label: "Conversation",  icon: "message-2" },
  { id: "citations",     label: "Citations",     icon: "quote" },
  { id: "intelligence",  label: "Intelligence",  icon: "brain",       stub: true },
  { id: "advanced",      label: "Advanced",      icon: "sliders" },
  { id: "security",      label: "Security",      icon: "shield-check" },
];

const ACTIVE_TABS = TABS.filter(t => !t.stub).map(t => t.id);

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PersonalizePage() {
  const [activeTab, setActiveTab] = useState("general");
  const [draft, setDraft] = useState<Settings>({ ...DEFAULTS });
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

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const handleSave = useCallback(() => {
    setSavedTabs(prev => new Set([...prev, activeTab]));
    setDirtyTabs(prev => { const n = new Set(prev); n.delete(activeTab); return n; });
    showToast("Settings saved");
  }, [activeTab]);

  const handlePublish = useCallback(() => {
    handleSave();
    setShowPublish(false);
    setPublished(true);
    showToast("Agent is now live!");
  }, [handleSave]);

  const progress = Math.round((savedTabs.size / ACTIVE_TABS.length) * 100);
  const isStub = !!TABS.find(t => t.id === activeTab)?.stub;

  return (
    <div className="app-shell">
      <AppSidebar />

      <div className="main">
        {/* Page header */}
        <header className="page-header">
          <div className="page-header-top">
            <div>
              <div className="page-title">Personalize &bull; {draft.agentName || "My Agent"}</div>
              <div className="page-subtitle">Settings here apply to all deployment options.</div>
            </div>
            <button className="cg-btn cg-btn-primary cg-btn-lg" onClick={() => setShowPublish(true)}>
              <i className="ti ti-rocket" style={{ fontSize: 16 }} />
              {published ? "Published" : "Publish"}
              {savedTabs.size < ACTIVE_TABS.length && (
                <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 999, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>
                  {savedTabs.size}/{ACTIVE_TABS.length}
                </span>
              )}
            </button>
          </div>

          {/* Tabs */}
          <nav className="tab-nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""} ${tab.stub ? "stub" : ""}`}
                onClick={() => !tab.stub && setActiveTab(tab.id)}
              >
                <i className={`ti ti-${tab.icon}`} style={{ fontSize: 14 }} />
                {tab.label}
                {!tab.stub && dirtyTabs.has(tab.id) && <span className="tab-dot" />}
                {!tab.stub && savedTabs.has(tab.id) && !dirtyTabs.has(tab.id) && (
                  <span className="tab-check">
                    <i className="ti ti-check" style={{ fontSize: 9 }} />
                  </span>
                )}
                {tab.stub && (
                  <span className="cg-badge cg-badge-gray" style={{ fontSize: 9, padding: "1px 5px" }}>Soon</span>
                )}
              </button>
            ))}
          </nav>
        </header>

        {/* Progress */}
        <div className="progress-wrap">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">{savedTabs.size} of {ACTIVE_TABS.length} sections configured</span>
        </div>

        {/* Content */}
        <div className="two-col">
          <div className="form-col">
            {activeTab === "general"      && <GeneralTab s={draft} set={set} />}
            {activeTab === "persona"      && <PlaceholderTab title="Persona" desc="Define your agent's personality, tone, and behavioral guidelines." />}
            {activeTab === "conversation" && <ConversationTab s={draft} set={set} />}
            {activeTab === "citations"    && <CitationsTab s={draft} set={set} />}
            {activeTab === "intelligence" && <PlaceholderTab title="Intelligence" desc="Configure AI model, data sources, and reasoning capabilities." />}
            {activeTab === "advanced"     && <AdvancedTab s={draft} set={set} />}
            {activeTab === "security"     && <SecurityTab s={draft} set={set} />}
          </div>

          <div className="preview-col">
            <PreviewPanel s={draft} />
          </div>
        </div>

        {/* Sticky save bar */}
        {!isStub && (
          <div className="save-bar">
            <div className="save-bar-status">
              {isDirty ? (
                <>
                  <span className="save-bar-dot" />
                  Unsaved changes in {TABS.find(t => t.id === activeTab)?.label}
                </>
              ) : (
                <span className="save-bar-ok">
                  <i className="ti ti-circle-check" style={{ fontSize: 16 }} />
                  All changes saved
                </span>
              )}
            </div>
            <button className="cg-btn cg-btn-primary" onClick={handleSave} disabled={!isDirty}>
              Save settings
            </button>
          </div>
        )}
      </div>

      {/* Publish modal */}
      {showPublish && <PublishModal s={draft} onClose={() => setShowPublish(false)} onPublish={handlePublish} />}

      {/* Toast */}
      {toast && (
        <div className="toast toast-success">
          <i className="ti ti-circle-check" style={{ fontSize: 16 }} />
          {toast}
        </div>
      )}
    </div>
  );
}
