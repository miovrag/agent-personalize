"use client";

import { useRef, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

// ─── Multi-Agent ─────────────────────────────────────────────────────────────

export interface ChildAgent {
  id: string;
  name: string;
  role: string;
}

export type FirstInteractionMode = "modal" | "primary";

// Mini diagram: branching modal choice
function DiagramModal() {
  return (
    <svg width="56" height="40" viewBox="0 0 56 40" fill="none">
      <circle cx="28" cy="8" r="5" fill="var(--cg-primary-100)" stroke="var(--cg-primary)" strokeWidth="1.2"/>
      <line x1="28" y1="13" x2="16" y2="26" stroke="var(--cg-gray-300)" strokeWidth="1.2"/>
      <line x1="28" y1="13" x2="40" y2="26" stroke="var(--cg-gray-300)" strokeWidth="1.2"/>
      <rect x="8" y="26" width="16" height="10" rx="3" fill="var(--cg-gray-100)" stroke="var(--cg-gray-300)" strokeWidth="1"/>
      <rect x="32" y="26" width="16" height="10" rx="3" fill="var(--cg-primary-100)" stroke="var(--cg-primary)" strokeWidth="1"/>
    </svg>
  );
}

// Mini diagram: direct route to primary
function DiagramDirect() {
  return (
    <svg width="56" height="40" viewBox="0 0 56 40" fill="none">
      <circle cx="28" cy="8" r="5" fill="var(--cg-primary-100)" stroke="var(--cg-primary)" strokeWidth="1.2"/>
      <line x1="28" y1="13" x2="28" y2="26" stroke="var(--cg-primary)" strokeWidth="1.5" strokeDasharray="2 2"/>
      <rect x="16" y="26" width="24" height="10" rx="3" fill="var(--cg-primary-100)" stroke="var(--cg-primary)" strokeWidth="1.2"/>
    </svg>
  );
}

interface SortableAgentRowProps {
  agent: ChildAgent;
  index: number;
  total: number;
  isPrimary: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSetPrimary: () => void;
}

function SortableAgentRow({ agent, index, total, isPrimary, onMoveUp, onMoveDown, onSetPrimary }: SortableAgentRowProps) {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: agent.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: [transition, "border-color 120ms, background 120ms"].filter(Boolean).join(", "),
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 8,
        border: `1.5px solid ${isPrimary ? "var(--cg-primary)" : hovered ? "var(--cg-border)" : "var(--cg-divider)"}`,
        background: isPrimary ? "var(--cg-primary-8)" : "var(--cg-bg-card)",
        opacity: isDragging ? 0.4 : 1,
        userSelect: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Drag handle — always visible, labelled for screen readers */}
      <div
        {...listeners}
        {...attributes}
        aria-label="Drag to reorder"
        title="Drag to reorder"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          color: hovered ? "var(--cg-gray-400)" : "var(--cg-gray-200)",
          display: "flex", alignItems: "center", flexShrink: 0,
          transition: "color 120ms",
          touchAction: "none",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="5.5" cy="4"  r="1.2" fill="currentColor"/>
          <circle cx="5.5" cy="8"  r="1.2" fill="currentColor"/>
          <circle cx="5.5" cy="12" r="1.2" fill="currentColor"/>
          <circle cx="10.5" cy="4"  r="1.2" fill="currentColor"/>
          <circle cx="10.5" cy="8"  r="1.2" fill="currentColor"/>
          <circle cx="10.5" cy="12" r="1.2" fill="currentColor"/>
        </svg>
      </div>

      {/* Position badge */}
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        background: isPrimary ? "var(--cg-primary)" : "var(--cg-gray-100)",
        border: isPrimary ? "none" : "1px solid var(--cg-divider)",
        display: "flex", alignItems: "center", justifyContent: "center",
        font: "700 10px/1 var(--cg-font)",
        color: isPrimary ? "#fff" : "var(--cg-fg-4)",
      }}>
        {index + 1}
      </div>

      {/* Agent info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ font: "600 13px/18px var(--cg-font)", color: "var(--cg-fg-1)" }}>{agent.name}</span>
          {isPrimary ? (
            <span style={{
              font: "600 10px/14px var(--cg-font)", color: "var(--cg-primary)",
              background: "var(--cg-primary-100)", borderRadius: 999,
              padding: "1px 7px", flexShrink: 0,
            }}>
              ★ Primary
            </span>
          ) : (
            <button
              onClick={onSetPrimary}
              style={{
                font: "500 10px/14px var(--cg-font)", color: "var(--cg-fg-4)",
                background: "transparent", border: "1px solid var(--cg-divider)",
                borderRadius: 999, padding: "1px 7px", cursor: "pointer",
                opacity: hovered ? 1 : 0, transition: "opacity 120ms",
                flexShrink: 0,
              }}
              title="Make this the primary agent"
            >
              Set as primary
            </button>
          )}
        </div>
        <div style={{ font: "400 11px/16px var(--cg-font)", color: "var(--cg-fg-4)", marginTop: 1 }}>{agent.role}</div>
      </div>

      {/* Up / down buttons — always accessible, discoverable on hover */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          aria-label="Move up"
          style={{
            width: 20, height: 20, border: "1px solid var(--cg-divider)", borderRadius: 4,
            background: "var(--cg-bg-card)", cursor: index === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: index === 0 ? 0.3 : hovered ? 1 : 0.5, transition: "opacity 120ms",
            color: "var(--cg-fg-3)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 6.5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          aria-label="Move down"
          style={{
            width: 20, height: 20, border: "1px solid var(--cg-divider)", borderRadius: 4,
            background: "var(--cg-bg-card)", cursor: index === total - 1 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: index === total - 1 ? 0.3 : hovered ? 1 : 0.5, transition: "opacity 120ms",
            color: "var(--cg-fg-3)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function MultiAgentSection({
  agents,
  onReorder,
  firstInteraction,
  onFirstInteractionChange,
}: {
  agents: ChildAgent[];
  onReorder: (agents: ChildAgent[]) => void;
  firstInteraction: FirstInteractionMode;
  onFirstInteractionChange: (v: FirstInteractionMode) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = agents.findIndex((a) => a.id === active.id);
      const newIndex = agents.findIndex((a) => a.id === over.id);
      onReorder(arrayMove(agents, oldIndex, newIndex));
    }
  }, [agents, onReorder]);

  const move = useCallback((from: number, to: number) => {
    if (to < 0 || to >= agents.length) return;
    onReorder(arrayMove(agents, from, to));
  }, [agents, onReorder]);

  const setPrimary = useCallback((index: number) => {
    onReorder(arrayMove(agents, index, 0));
  }, [agents, onReorder]);

  const primary = agents[0];

  const routingOpts: { value: FirstInteractionMode; label: string; desc: string; diagram: React.ReactNode }[] = [
    {
      value: "modal",
      label: "Show selection modal",
      desc: "User chooses which agent to talk to — recommended when agents serve distinct audiences.",
      diagram: <DiagramModal />,
    },
    {
      value: "primary",
      label: "Route directly to primary",
      desc: `New users land straight in "${primary?.name ?? "first agent"}" without seeing a selection screen.`,
      diagram: <DiagramDirect />,
    },
  ];

  return (
    <div style={{ padding: "18px 0", borderBottom: "1px solid var(--cg-divider)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
        <SettingsIcon />
        <span style={{ font: "600 13px/18px var(--cg-font)", color: "var(--cg-fg-1)" }}>Child Agents</span>
        <InfoIcon tooltip="Reorder child agents by dragging, using the arrow buttons, or clicking 'Set as primary'. The top agent is the primary — highlighted in the selection modal and used as the default route." />
        {/* Live status summary */}
        <span style={{
          marginLeft: "auto",
          font: "400 11px/16px var(--cg-font)", color: "var(--cg-fg-4)",
        }}>
          Primary: <strong style={{ color: "var(--cg-fg-2)" }}>{primary?.name ?? "—"}</strong>
          {" "}· {agents.length} agent{agents.length !== 1 ? "s" : ""}
        </span>
      </div>
      <p style={{ font: "400 11px/16px var(--cg-font)", color: "var(--cg-fg-4)", margin: "0 0 12px" }}>
        Drag, use ↑↓ buttons, or click <em>Set as primary</em> to reorder. First in the list is primary.
      </p>

      {/* Sortable list */}
      {agents.length === 0 ? (
        <div style={{
          padding: "24px 16px", borderRadius: 8, border: "1px dashed var(--cg-divider)",
          textAlign: "center", font: "400 12px/18px var(--cg-font)", color: "var(--cg-fg-4)",
        }}>
          No child agents added yet.
        </div>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={agents.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {agents.map((agent, i) => (
                  <SortableAgentRow
                    key={agent.id}
                    agent={agent}
                    index={i}
                    total={agents.length}
                    isPrimary={i === 0}
                    onMoveUp={() => move(i, i - 1)}
                    onMoveDown={() => move(i, i + 1)}
                    onSetPrimary={() => setPrimary(i)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Separator hint */}
          {agents.length > 1 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginTop: 8,
              font: "400 10px/14px var(--cg-font)", color: "var(--cg-fg-4)",
            }}>
              <div style={{ flex: 1, height: 1, background: "var(--cg-divider)" }} />
              <span>Primary above · Others below</span>
              <div style={{ flex: 1, height: 1, background: "var(--cg-divider)" }} />
            </div>
          )}
        </>
      )}

      {/* First-time interaction */}
      <div style={{ marginTop: 16, padding: "14px 16px", background: "var(--cg-gray-50)", borderRadius: 10, border: "1px solid var(--cg-divider)" }}>
        <div style={{ font: "600 12px/16px var(--cg-font)", color: "var(--cg-fg-2)", marginBottom: 12 }}>
          When a user opens this agent for the first time
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {routingOpts.map((opt) => {
            const selected = firstInteraction === opt.value;
            return (
              <label
                key={opt.value}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
                  padding: "10px 12px", borderRadius: 8,
                  border: `1.5px solid ${selected ? "var(--cg-primary)" : "var(--cg-divider)"}`,
                  background: selected ? "var(--cg-primary-8)" : "var(--cg-bg-card)",
                  transition: "border-color 120ms, background 120ms",
                }}
                onClick={() => onFirstInteractionChange(opt.value)}
              >
                {/* Radio dot */}
                <div style={{
                  width: 16, height: 16, borderRadius: "50%", marginTop: 2, flexShrink: 0,
                  border: `2px solid ${selected ? "var(--cg-primary)" : "var(--cg-border)"}`,
                  background: "var(--cg-bg-card)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {selected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cg-primary)" }} />}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "600 13px/18px var(--cg-font)", color: "var(--cg-fg-1)", marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ font: "400 11px/16px var(--cg-font)", color: "var(--cg-fg-4)" }}>{opt.desc}</div>
                </div>

                {/* Mini diagram */}
                <div style={{ flexShrink: 0, opacity: selected ? 1 : 0.4, transition: "opacity 120ms" }}>
                  {opt.diagram}
                </div>
              </label>
            );
          })}
        </div>

        {/* Impact callout — only when "Route to primary" is active */}
        {firstInteraction === "primary" && primary && (
          <div style={{
            marginTop: 12, padding: "10px 12px", borderRadius: 8,
            background: "var(--cg-warning-100)", border: "1px solid var(--cg-warning)",
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--cg-warning-700)", flexShrink: 0, marginTop: 1 }}>
              <path d="M8 1.5L1 14.5h14L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M8 6v4M8 11.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span style={{ font: "400 11px/16px var(--cg-font)", color: "var(--cg-warning-700)" }}>
              New users will land directly in <strong>{primary.name}</strong>. Reordering agents will change who they reach first.
            </span>
          </div>
        )}
      </div>
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

  const [childAgents, setChildAgents] = useState<ChildAgent[]>([
    { id: "a1", name: "Sales Assistant", role: "Lead Generation" },
    { id: "a2", name: "Support Bot",     role: "Customer Support" },
    { id: "a3", name: "Knowledge Base",  role: "Enterprise Search" },
  ]);
  const [firstInteraction, setFirstInteraction] = useState<FirstInteractionMode>("modal");

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

        {/* Multi-Agent */}
        <MultiAgentSection
          agents={childAgents}
          onReorder={setChildAgents}
          firstInteraction={firstInteraction}
          onFirstInteractionChange={setFirstInteraction}
        />

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
