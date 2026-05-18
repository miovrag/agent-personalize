"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable,
  verticalListSortingStrategy, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StarterQuestions from "@/components/StarterQuestions";
import GeneralSettings from "@/components/GeneralSettings";
import ConversationSettings from "@/components/ConversationSettings";

// ─── Child Agent ──────────────────────────────────────────────────────────────

interface ChildAgent {
  id: string;
  name: string;
  role: string;
  queries: number;
}

const AVATAR_COLORS = ["#7367F0", "#28C76F", "#FF9F43", "#00CFE8", "#EA5455", "#9C8FFF"];

function agentInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function AgentAvatar({ name, index }: { name: string; index: number }) {
  const bg = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      font: "600 12px/1 var(--cg-font)", color: "#fff",
    }}>
      {agentInitials(name)}
    </div>
  );
}

// ─── Confirm Primary Modal ────────────────────────────────────────────────────

function ConfirmPrimaryModal({
  agentName,
  onConfirm,
  onCancel,
}: {
  agentName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(23,23,23,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div style={{
        background: "#FFFFFF", borderRadius: 16,
        width: "100%", maxWidth: 380,
        padding: "28px 24px 24px",
        boxShadow: "0 4px 18px rgba(23,23,23,.08)",
      }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px",
          background: "#EAE8FD",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="ti ti-star" style={{ fontSize: 22, color: "#7367F0" }} />
        </div>

        {/* Title */}
        <h3 style={{
          margin: "0 0 8px", textAlign: "center",
          font: "600 18px/24px var(--cg-font-sans)", color: "#171717",
        }}>
          Set as primary?
        </h3>

        {/* Body */}
        <p style={{
          margin: "0 0 24px", textAlign: "center",
          font: "400 14px/1.6 var(--cg-font-body)", color: "#737373",
        }}>
          <strong style={{ color: "#404040" }}>{agentName}</strong> will become the primary agent and will be shown first to new users.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: 40, borderRadius: 8,
              border: "1px solid #E5E5E5", background: "#FFFFFF",
              font: "500 14px/1 var(--cg-font-sans)", color: "#404040",
              cursor: "pointer", transition: "border-color 120ms",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, height: 40, borderRadius: 8,
              border: "none", background: "#7367F0",
              font: "500 14px/1 var(--cg-font-sans)", color: "#FFFFFF",
              cursor: "pointer", boxShadow: "0 4px 24px rgba(115,103,240,.35)",
              transition: "background 120ms",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Build Row ───────────────────────────────────────────────────────

function SortableBuildRow({
  agent, index, total, onSetPrimary,
}: {
  agent: ChildAgent; index: number; total: number; onSetPrimary: () => void;
}) {
  const isPrimary = index === 0;
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: agent.id });

  return (
    <tr
      ref={setNodeRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        background: isDragging ? "#F8F7FA" : hovered ? "#FAFAFA" : "transparent",
        borderBottom: index < total - 1 ? "1px solid #F3F2F5" : "none",
      }}
    >
      {/* Drag handle */}
      <td style={{ padding: "14px 4px 14px 16px", width: 28, verticalAlign: "middle" }}>
        <div
          {...listeners}
          {...attributes}
          aria-label="Drag to reorder"
          style={{ cursor: isDragging ? "grabbing" : "grab", color: "#C4C4CC", display: "flex", alignItems: "center", touchAction: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="5.5" cy="4"  r="1.3" fill="currentColor"/>
            <circle cx="5.5" cy="8"  r="1.3" fill="currentColor"/>
            <circle cx="5.5" cy="12" r="1.3" fill="currentColor"/>
            <circle cx="10.5" cy="4"  r="1.3" fill="currentColor"/>
            <circle cx="10.5" cy="8"  r="1.3" fill="currentColor"/>
            <circle cx="10.5" cy="12" r="1.3" fill="currentColor"/>
          </svg>
        </div>
      </td>
      {/* Agent name + Primary badge */}
      <td style={{ padding: "14px 16px 14px 4px", verticalAlign: "middle" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AgentAvatar name={agent.name} index={index} />
          <span style={{ font: "400 13px/20px var(--cg-font-body)", color: "#4B465C" }}>
            {agent.name}
          </span>
          {isPrimary && (
            <span style={{
              background: "rgba(115,103,240,.12)", color: "#5C53C0",
              borderRadius: 4, padding: "2px 10px",
              font: "600 11px/16px var(--cg-font-sans)", flexShrink: 0,
            }}>
              Primary
            </span>
          )}
        </div>
      </td>
      {/* Queries */}
      <td style={{ padding: "14px 16px", font: "400 13px/20px var(--cg-font-body)", color: "#4B465C", verticalAlign: "middle" }}>
        {agent.queries}
      </td>
      {/* Actions */}
      <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isPrimary && (
            <button
              onClick={onSetPrimary}
              style={{
                height: 28, padding: "0 10px", borderRadius: 6,
                border: "1px solid #E5E5E5", background: "#FFFFFF",
                font: "500 12px/1 var(--cg-font-sans)", color: "#7367F0",
                cursor: "pointer", whiteSpace: "nowrap",
                opacity: hovered ? 1 : 0, transition: "opacity 120ms, border-color 120ms",
              }}
            >
              Set as primary
            </button>
          )}
          <i className="ti ti-settings" style={{ fontSize: 18, cursor: "pointer", color: "#82868B" }} />
          <i className="ti ti-trash-x" style={{ fontSize: 18, cursor: "pointer", color: "#82868B" }} />
        </div>
      </td>
    </tr>
  );
}

// ─── Add Agents Modal ─────────────────────────────────────────────────────────

const AVAILABLE_AGENTS = [
  { id: "av1", name: "My Customer Support Agent",   disabled: false },
  { id: "av2", name: "My Customer Support Pro",     disabled: false },
  { id: "av3", name: "My Website Copilot",          disabled: false },
  { id: "av4", name: "My Agent",                    disabled: true  },
  { id: "av5", name: "Град Ниш (2)",                disabled: true  },
];

function AddAgentsModal({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = AVAILABLE_AGENTS.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(23,23,23,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Wrapper keeps close button visible outside overflow:hidden modal */}
      <div style={{ position: "relative", width: "100%", maxWidth: 600 }}>
        {/* Close — radius-full, shadow-sm, border-default */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: -14, right: -14, zIndex: 10,
            width: 32, height: 32, borderRadius: 999,
            background: "#FFFFFF", border: "1px solid #E5E5E5",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 4px rgba(23,23,23,.08)", color: "#171717",
          }}
        >
          <i className="ti ti-x" style={{ fontSize: 16 }} />
        </button>

        {/* DS modal — radius-xl (16px), bg-surface, shadow-default */}
        <div style={{
          background: "#FFFFFF", borderRadius: 16,
          width: "100%",
          padding: "28px 24px 24px",
          boxShadow: "0 4px 18px rgba(23,23,23,.08)",
          overflow: "hidden",
        }}>

        {/* Title — text-2xl weight-semibold text-heading */}
        <h2 style={{
          margin: "0 0 8px", textAlign: "center",
          font: "600 24px/32px var(--cg-font-sans)", color: "#171717",
          letterSpacing: "-0.01em",
        }}>
          Add agents to the Multi-Agent
        </h2>

        {/* Subtitle — text-sm text-body */}
        <p style={{ margin: "0 0 4px", font: "400 14px/1.6 var(--cg-font-body)", color: "#404040" }}>
          Please select agents you want to add to this Multi-Agent.
        </p>
        {/* Helper — text-sm text-muted */}
        <p style={{ margin: "0 0 24px", font: "400 14px/1.6 var(--cg-font-body)", color: "#737373" }}>
          You can add up to 8 agents. If you wish to add more, please{" "}
          <a href="#" style={{ color: "#7367F0", textDecoration: "none" }}>contact sales</a>.
        </p>

        {/* Search + filters — spacing-sm (8px) gap, input radius-md (8px), height 40px */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              style={{
                width: "100%", height: 40, padding: "0 40px 0 12px",
                border: "1px solid #E5E5E5", borderRadius: 8, outline: "none",
                font: "400 14px/1 var(--cg-font-body)", color: "#171717",
                background: "#FFFFFF", transition: "border-color 120ms",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#7367F0"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5E5"; }}
            />
            <i className="ti ti-search" style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              fontSize: 16, color: "#A3A3A3", pointerEvents: "none",
            }} />
          </div>

          {/* btn-ghost style dropdowns — radius-md, border-default */}
          {[
            { label: "All Time",     icon: "ti-calendar" },
            { label: "Newest First", icon: null           },
          ].map(({ label, icon }) => (
            <button key={label} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              height: 40, padding: "0 12px", borderRadius: 8,
              border: "1px solid #E5E5E5", background: "#FFFFFF", cursor: "pointer",
              font: "500 14px/1 var(--cg-font-sans)", color: "#404040",
              transition: "border-color 120ms",
            }}>
              {icon && <i className={`ti ${icon}`} style={{ fontSize: 15, color: "#737373" }} />}
              {label}
              <i className="ti ti-chevron-down" style={{ fontSize: 14, color: "#737373" }} />
            </button>
          ))}
        </div>

        {/* Agent cards grid — spacing-sm (8px) gap, radius-md cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8,
          minHeight: 160, marginBottom: 24,
        }}>
          {filtered.map((agent, i) => {
            const isSelected = selected.has(agent.id);
            return (
              <button
                key={agent.id}
                onClick={() => toggle(agent.id, agent.disabled)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px",
                  border: `1px solid ${isSelected ? "#7367F0" : "#E5E5E5"}`,
                  borderRadius: 8,
                  background: isSelected ? "#EAE8FD" : "#FFFFFF",
                  cursor: agent.disabled ? "default" : "pointer",
                  textAlign: "left", opacity: agent.disabled ? 0.45 : 1,
                  transition: "border-color 120ms, background 120ms",
                }}
              >
                {/* Avatar — 28px in modal context */}
                <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  font: "600 10px/1 var(--cg-font-sans)", color: "#fff" }}>
                  {agentInitials(agent.name)}
                </div>
                {/* Name — text-sm text-body */}
                <span style={{
                  font: "500 13px/18px var(--cg-font-sans)",
                  color: "#404040",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  flex: 1,
                }}>
                  {agent.name}
                </span>
                {/* Checkbox — radius-sm (4px) */}
                <div style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${isSelected ? "#7367F0" : "#D4D4D4"}`,
                  background: isSelected ? "#7367F0" : "#FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color 120ms, background 120ms",
                }}>
                  {isSelected && <i className="ti ti-check" style={{ fontSize: 10, color: "#fff" }} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA — btn-primary, radius-md, height 40px */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            disabled={selected.size === 0}
            style={{
              height: 40, padding: "0 24px", borderRadius: 8,
              border: "none", cursor: selected.size === 0 ? "not-allowed" : "pointer",
              background: selected.size === 0 ? "#DBDADE" : "#7367F0",
              color: selected.size === 0 ? "#A3A3A3" : "#FFFFFF",
              font: "500 14px/1 var(--cg-font-sans)",
              boxShadow: selected.size > 0 ? "0 4px 24px rgba(115,103,240,.35)" : "none",
              transition: "background 120ms, box-shadow 120ms",
            }}
          >
            Create Multi-Agent
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

// ─── Build Page ───────────────────────────────────────────────────────────────

function BuildPage({
  agents,
  onReorder,
  agentName,
  onPublish,
}: {
  agents: ChildAgent[];
  onReorder: (agents: ChildAgent[]) => void;
  agentName: string;
  onPublish: () => void;
}) {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmPrimary, setConfirmPrimary] = useState<{ name: string; execute: () => void } | null>(null);
  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = agents.findIndex((a) => a.id === active.id);
    const newIndex = agents.findIndex((a) => a.id === over.id);
    if (oldIndex === newIndex) return;

    if (newIndex === 0 || oldIndex === 0) {
      // Primary slot changes — ask for confirmation
      const newPrimary = newIndex === 0 ? agents[oldIndex] : agents[1];
      setConfirmPrimary({
        name: newPrimary.name,
        execute: () => onReorder(arrayMove(agents, oldIndex, newIndex)),
      });
    } else {
      onReorder(arrayMove(agents, oldIndex, newIndex));
    }
  }, [agents, onReorder]);

  return (
    <div className="main">
      {/* Page header */}
      <header className="page-header">
        <div className="page-header-top">
          <div className="page-title">
            Build &bull; {agentName || "My Multi-Agent"} &bull; Agents
          </div>
          <button className="cg-btn cg-btn-primary cg-btn-lg" onClick={onPublish}>
            <i className="ti ti-rocket" style={{ fontSize: 16 }} />
            Publish
          </button>
        </div>

      </header>

      {/* Search + Add */}
      <div style={{ margin: "0 28px", display: "flex", gap: 12, alignItems: "stretch" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            style={{
              width: "100%", height: 44, padding: "0 44px 0 16px",
              border: "1px solid #DBDADE", borderRadius: 8,
              background: "#fff", outline: "none",
              font: "400 15px/24px var(--cg-font-body)", color: "#21231E",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#7367F0"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(115,103,240,.16)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#DBDADE"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <i className="ti ti-search" style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 18, color: "#9AA7A3", pointerEvents: "none",
          }} />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            height: 44, padding: "0 20px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "#7367F0", color: "#fff",
            font: "500 15px/20px var(--cg-font-sans)", whiteSpace: "nowrap",
            boxShadow: "0 2px 6px rgba(115,103,240,.35)",
          }}
        >
          <i className="ti ti-plus" style={{ fontSize: 18 }} />
          Add Agents
        </button>
      </div>

      {/* Add Agents modal */}
      {showAddModal && <AddAgentsModal onClose={() => setShowAddModal(false)} />}

      {/* Agents table */}
      <div style={{
        margin: "16px 28px 32px",
        border: "1px solid #EBE9F1", borderRadius: 6,
        background: "#fff", overflow: "hidden",
        boxShadow: "0 4px 24px rgba(75,70,92,.06)",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8F7FA" }}>
              {/* drag handle column — no header */}
              <th style={{ width: 44, borderBottom: "1px solid #EBE9F1" }} />
              {["AGENT NAME", "QUERIES (THIS BILLING CYCLE)", "ACTIONS"].map((h) => (
                <th key={h} style={{
                  textAlign: "left", padding: "12px 16px",
                  font: "600 12px/16px var(--cg-font-sans)", color: "#82868B",
                  letterSpacing: ".06em", textTransform: "uppercase",
                  borderBottom: "1px solid #EBE9F1", whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={agents.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{
                      padding: "40px 16px", textAlign: "center",
                      font: "400 13px/20px var(--cg-font-body)", color: "#82868B",
                    }}>
                      {search ? "No agents match your search." : "No agents added yet."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((agent, i) => (
                    <SortableBuildRow
                      key={agent.id}
                      agent={agent}
                      index={agents.findIndex((a) => a.id === agent.id)}
                      total={agents.length}
                      onSetPrimary={() => {
                        const idx = agents.findIndex((a) => a.id === agent.id);
                        setConfirmPrimary({
                          name: agent.name,
                          execute: () => onReorder(arrayMove(agents, idx, 0)),
                        });
                      }}
                    />
                  ))
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      {confirmPrimary && (
        <ConfirmPrimaryModal
          agentName={confirmPrimary.name}
          onConfirm={() => { confirmPrimary.execute(); setConfirmPrimary(null); }}
          onCancel={() => setConfirmPrimary(null)}
        />
      )}
    </div>
  );
}

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
  agentAvatarUrl: string;
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
  loadingIndicator: "typing-dots" | "custom-message";
  loadingCustomMessage: string;
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
  aiWarning: string;
  antiHallucination: boolean;
  agentVisibility: Visibility;
  recaptchaEnabled: boolean;
  whitelistedDomains: string;
  conversationRetention: RetentionPeriod;
  retentionDays: number;
  agentInstructions: string;
}

const DEFAULTS: Settings = {
  agentName: "My Agent",
  agentRole: "enterprise-search",
  avatarInitials: "MA",
  agentAvatarUrl: "",
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
  loadingIndicator: "typing-dots",
  loadingCustomMessage: "",
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
  aiWarning: "",
  antiHallucination: true,
  agentVisibility: "public",
  recaptchaEnabled: false,
  whitelistedDomains: "",
  conversationRetention: "never",
  retentionDays: 30,
  agentInstructions: "",
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
              <input type="radio" name="loading" value="typing-dots" checked={s.loadingIndicator === "typing-dots"} onChange={() => set("loadingIndicator", "typing-dots")} />
              <span className="radio-opt-label">Typing dot animation</span>
            </label>
            <label className="radio-opt">
              <input type="radio" name="loading" value="custom-message" checked={s.loadingIndicator === "custom-message"} onChange={() => set("loadingIndicator", "custom-message")} />
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
        <FieldRow icon="robot" label="AI warning" hint="Shown below the input on every deployment">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <input
              className="cg-input"
              value={s.aiWarning}
              maxLength={150}
              onChange={e => set("aiWarning", e.target.value)}
              placeholder="e.g. AI can make mistakes. Verify important info."
            />
            <span style={{ font: "400 11px/14px var(--cg-font)", color: s.aiWarning.length >= 140 ? "var(--cg-warning)" : "var(--cg-fg-4)", alignSelf: "flex-end" }}>
              {s.aiWarning.length}/150
            </span>
          </div>
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

// ─── Instructions Panel ───────────────────────────────────────────────────────

const INSTRUCTIONS_MAX = 4000;

function InstructionsPanel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="instructions-panel">
      <div className="instructions-header">
        <span className="instructions-label">Agent instructions</span>
        <span className="instructions-count">{value.length} / {INSTRUCTIONS_MAX}</span>
      </div>
      <textarea
        className="instructions-textarea"
        value={value}
        onChange={e => onChange(e.target.value.slice(0, INSTRUCTIONS_MAX))}
        placeholder={"Write custom instructions for your agent. These will be included in every conversation as the system prompt.\n\nExample:\nYou are a helpful customer support agent. Always be polite and professional. If you don't know the answer, say so clearly and offer to escalate to a human."}
      />
    </div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanel({
  s,
  set,
  rightPanel,
  onRightPanelChange,
}: {
  s: Settings;
  set: (k: keyof Settings, v: unknown) => void;
  rightPanel: "preview" | "instructions";
  onRightPanelChange: (v: "preview" | "instructions") => void;
}) {
  const radius = { sharp: "0px", soft: "12px", round: "20px" }[s.agentStyle];

  return (
    <div className="preview-card">
      <div className="preview-toolbar">
        <div className="preview-dots">
          <div className="preview-dot" style={{ background: "#FF5F57" }} />
          <div className="preview-dot" style={{ background: "#FFBD2E" }} />
          <div className="preview-dot" style={{ background: "#28C840" }} />
        </div>
        <div className="seg-ctrl">
          <button
            className={`seg-btn ${rightPanel === "preview" ? "active" : ""}`}
            onClick={() => onRightPanelChange("preview")}
          >
            <i className="ti ti-eye" style={{ fontSize: 11 }} />
            Preview
          </button>
          <button
            className={`seg-btn ${rightPanel === "instructions" ? "active" : ""}`}
            onClick={() => onRightPanelChange("instructions")}
          >
            <i className="ti ti-file-text" style={{ fontSize: 11 }} />
            Instructions
          </button>
        </div>
        <button className="cg-btn cg-btn-ghost" style={{ padding: "4px 6px" }}>
          <i className="ti ti-arrows-maximize" style={{ fontSize: 13 }} />
        </button>
      </div>

      {rightPanel === "preview" ? (
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
            {(s.aiWarning || !s.removeBranding) && (
              <div className="chat-footer-meta">
                {s.aiWarning && (
                  <div className="chat-ai-warning">
                    <i className="ti ti-info-circle" style={{ fontSize: 10, flexShrink: 0 }} />
                    <span>{s.aiWarning}</span>
                  </div>
                )}
                {!s.removeBranding && (
                  <div className="chat-branding">Powered by CustomGPT.ai</div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <InstructionsPanel
          value={s.agentInstructions}
          onChange={v => set("agentInstructions", v)}
        />
      )}
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

// ─── DS Left Panel ────────────────────────────────────────────────────────────

const AGENT_NAV = [
  { id: "build",       label: "Build",       icon: "hammer"    },
  { id: "personalize", label: "Personalize", icon: "brush"     },
  { id: "ask",         label: "Ask",         icon: "message-2", stub: true },
  { id: "deploy",      label: "Deploy",      icon: "rocket",    stub: true },
];

function DSLeftPanel({
  agentName,
  pageView,
  onPageChange,
}: {
  agentName: string;
  pageView: string;
  onPageChange: (v: string) => void;
}) {
  return (
    <aside style={{
      width: 260, flexShrink: 0,
      background: "#fff",
      borderRight: "1px solid #EBE9F1",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 20px 16px", borderBottom: "1px solid #F3F2F5",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="CustomGPT" style={{ width: 28, height: 28 }} />
          <span style={{ font: "700 18px/24px var(--cg-font-sans)", color: "#21231E", letterSpacing: ".2px" }}>
            CustomGPT
          </span>
        </div>
        <button style={{ color: "#82868B", padding: 0, lineHeight: 0 }}>
          <i className="ti ti-layout-grid" style={{ fontSize: 18 }} />
        </button>
      </div>

      {/* New Agent button */}
      <div style={{ padding: "16px 12px 0" }}>
        <button style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, height: 40, borderRadius: 8, border: "none", cursor: "pointer",
          background: "#7367F0", color: "#fff",
          font: "600 14px/1 var(--cg-font-sans)",
          boxShadow: "0 2px 6px rgba(115,103,240,.35)",
        }}>
          <i className="ti ti-plus" style={{ fontSize: 16 }} />
          New Agent
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 12px 0" }}>
        {/* Agent context back */}
        <button style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", margin: "0 0 4px", borderRadius: 6,
          background: "transparent", border: "none", cursor: "pointer",
          color: "#4B465C", font: "500 15px/20px var(--cg-font-sans)", textAlign: "left",
        }}>
          <i className="ti ti-chevron-left" style={{ fontSize: 18, opacity: 0.5, flexShrink: 0 }} />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {agentName || "My Multi-Agent"}
          </span>
        </button>

        {/* Agent pages */}
        {AGENT_NAV.map((item) => {
          const isActive = pageView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => !item.stub && onPageChange(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", margin: "2px 0", borderRadius: 6, border: "none",
                cursor: item.stub ? "default" : "pointer",
                background: isActive ? "linear-gradient(118deg,#7367F0,#9E95F5)" : "transparent",
                color: isActive ? "#fff" : item.stub ? "#82868B" : "#4B465C",
                boxShadow: isActive ? "0 2px 6px rgba(115,103,240,.35)" : "none",
                font: "500 15px/20px var(--cg-font-sans)",
                transition: "background .12s, color .12s",
              }}
              onMouseEnter={(e) => { if (!isActive && !item.stub) e.currentTarget.style.background = "rgba(75,70,92,.04)"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <i className={`ti ti-${item.icon}`} style={{ fontSize: 20, flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
              {item.stub && (
                <span style={{
                  background: "rgba(75,70,92,.08)", color: "#82868B",
                  borderRadius: 4, padding: "2px 8px",
                  font: "600 10px/14px var(--cg-font-sans)",
                }}>
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Copilot */}
      <div style={{ padding: "16px", borderTop: "1px solid #F3F2F5" }}>
        <div style={{
          font: "600 11px/16px var(--cg-font-sans)", color: "#82868B",
          letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8,
        }}>
          CustomGPT.ai Copilot
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 10px", borderRadius: 8,
          border: "1px solid #EBE9F1", background: "#F8F7FA",
        }}>
          <input
            placeholder="I need help with..."
            style={{
              flex: 1, border: "none", background: "transparent",
              font: "400 13px/18px var(--cg-font-body)", color: "#4B465C",
              outline: "none",
            }}
          />
          <i className="ti ti-send-2" style={{ fontSize: 15, color: "#7367F0", cursor: "pointer" }} />
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

const INITIAL_AGENTS: ChildAgent[] = [
  { id: "a1", name: "Onboarding Agent",    role: "Lead Generation",   queries: 1842 },
  { id: "a2", name: "Technical Support",   role: "Customer Support",  queries: 3417 },
  { id: "a3", name: "Billing Assistant",   role: "Customer Support",  queries: 964  },
  { id: "a4", name: "Knowledge Base",      role: "Enterprise Search", queries: 7283 },
  { id: "a5", name: "Sales Copilot",       role: "Lead Generation",   queries: 512  },
];

export default function PersonalizePage() {
  const [pageView, setPageView] = useState<string>("build");
  const [childAgents, setChildAgents] = useState<ChildAgent[]>(INITIAL_AGENTS);
  const [activeTab, setActiveTab] = useState("general");
  const [draft, setDraft] = useState<Settings>({ ...DEFAULTS });
  const [savedTabs, setSavedTabs] = useState<Set<string>>(new Set());
  const [dirtyTabs, setDirtyTabs] = useState<Set<string>>(new Set());
  const [showPublish, setShowPublish] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [rightPanel, setRightPanel] = useState<"preview" | "instructions">("preview");
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
      <DSLeftPanel
        agentName={draft.agentName || "My Multi-Agent"}
        pageView={pageView}
        onPageChange={setPageView}
      />

      {/* Build view */}
      {pageView === "build" && (
        <BuildPage
          agents={childAgents}
          onReorder={setChildAgents}
          agentName={draft.agentName || "My Multi-Agent"}
          onPublish={() => setShowPublish(true)}
        />
      )}

      {/* Personalize view */}
      {pageView === "personalize" && (
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
            {activeTab === "general"      && <GeneralSettings s={draft} set={set} childAgents={childAgents} onReorderChildAgents={setChildAgents} />}
            {activeTab === "persona"      && <PlaceholderTab title="Persona" desc="Define your agent's personality, tone, and behavioral guidelines." />}
            {activeTab === "conversation" && <ConversationSettings s={draft} set={set} />}
            {activeTab === "citations"    && <CitationsTab s={draft} set={set} />}
            {activeTab === "intelligence" && <PlaceholderTab title="Intelligence" desc="Configure AI model, data sources, and reasoning capabilities." />}
            {activeTab === "advanced"     && <AdvancedTab s={draft} set={set} />}
            {activeTab === "security"     && <SecurityTab s={draft} set={set} />}
          </div>

          <div className="preview-col">
            <PreviewPanel
              s={draft}
              set={set}
              rightPanel={rightPanel}
              onRightPanelChange={setRightPanel}
            />
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
      )}

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
