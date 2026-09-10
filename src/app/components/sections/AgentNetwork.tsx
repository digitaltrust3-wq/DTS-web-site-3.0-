import type { CSSProperties } from "react";
import {
  Activity,
  BookOpen,
  Bot,
  Building2,
  Database,
  Headphones,
  LifeBuoy,
  Mail,
  MessageSquare,
  Server,
  TrendingUp,
  Users,
  Webhook,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

type Agent = {
  id: string;
  icon: LucideIcon;
  label: Record<"es" | "en", string>;
};

type ExternalSystem = {
  id: string;
  agentId: string;
  icon: LucideIcon;
  label: Record<"es" | "en", string>;
};

const AGENTS: Agent[] = [
  { id: "support", icon: Headphones, label: { es: "Atención al cliente", en: "Customer support" } },
  { id: "sales", icon: TrendingUp, label: { es: "Ventas", en: "Sales" } },
  { id: "helpdesk", icon: LifeBuoy, label: { es: "Soporte técnico", en: "Technical support" } },
  { id: "data", icon: Activity, label: { es: "Análisis de datos", en: "Data analysis" } },
  { id: "crm", icon: Users, label: { es: "CRM", en: "CRM" } },
  { id: "email", icon: Mail, label: { es: "Correo electrónico", en: "Email" } },
  { id: "whatsapp", icon: MessageSquare, label: { es: "WhatsApp", en: "WhatsApp" } },
  { id: "knowledge", icon: BookOpen, label: { es: "Documentos y conocimiento", en: "Docs & knowledge" } },
  { id: "automation", icon: Workflow, label: { es: "Automatización", en: "Automation" } },
  { id: "monitoring", icon: Server, label: { es: "Monitoreo", en: "Monitoring" } },
];

const SYSTEMS: ExternalSystem[] = [
  { id: "crm-platform", agentId: "crm", icon: Building2, label: { es: "CRM", en: "CRM" } },
  { id: "database", agentId: "data", icon: Database, label: { es: "Base de datos", en: "Database" } },
  { id: "automations", agentId: "automation", icon: Zap, label: { es: "Automatizaciones", en: "Automations" } },
  { id: "email-server", agentId: "email", icon: Server, label: { es: "Email", en: "Email" } },
  { id: "whatsapp-api", agentId: "whatsapp", icon: MessageSquare, label: { es: "WhatsApp API", en: "WhatsApp API" } },
  { id: "knowledge-base", agentId: "knowledge", icon: BookOpen, label: { es: "Base de conocimiento", en: "Knowledge base" } },
  { id: "apis", agentId: "helpdesk", icon: Webhook, label: { es: "APIs", en: "APIs" } },
  { id: "internal-systems", agentId: "monitoring", icon: Server, label: { es: "Sistemas internos", en: "Internal systems" } },
];

const VIEWBOX = 900;
const CENTER = VIEWBOX / 2;
const AGENT_RADIUS = 300;
const SYSTEM_RADIUS = 400;

function polarPoint(radius: number, index: number, count: number) {
  const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

const labels = {
  es: {
    eyebrow: "Arquitectura de agentes",
    title: "Un orquestador, diez agentes especializados",
    description: "Así se ve una plataforma multiagente empresarial: un orquestador central coordina agentes especializados que se conectan con tus sistemas reales. Esta es una representación visual de la arquitectura, no una integración activa.",
    orchestrator: "Orquestador de IA",
    notice: "Vista conceptual — sin conexión a sistemas reales.",
  },
  en: {
    eyebrow: "Agent architecture",
    title: "One orchestrator, ten specialized agents",
    description: "This is what an enterprise multi-agent platform looks like: a central orchestrator coordinates specialized agents that connect to your real systems. This is a visual representation of the architecture, not a live integration.",
    orchestrator: "AI Orchestrator",
    notice: "Conceptual view — not connected to real systems.",
  },
};

export function AgentNetwork() {
  const { language } = useLanguage();
  const copy = labels[language];
  const agentPoints = AGENTS.map((agent, index) => ({ agent, point: polarPoint(AGENT_RADIUS, index, AGENTS.length) }));
  const agentPointById = new Map(agentPoints.map(({ agent, point }) => [agent.id, point]));

  return (
    <section className="agent-network-section" aria-label={copy.title}>
      <div className="agent-network-shell">
        <div className="agent-network-heading">
          <span className="agent-network-eyebrow">{copy.eyebrow}</span>
          <h2>{copy.title}</h2>
          <p>{copy.description}</p>
        </div>

        <div className="agent-network-stage">
          <svg
            className="agent-network-svg"
            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
            role="img"
            aria-label={copy.title}
          >
            <defs>
              <radialGradient id="orchestrator-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(94,234,212,0.35)" />
                <stop offset="100%" stopColor="rgba(94,234,212,0)" />
              </radialGradient>
            </defs>

            {/* orchestrator -> agent connections */}
            <g className="agent-network-lines">
              {agentPoints.map(({ agent, point }) => (
                <line
                  key={`line-${agent.id}`}
                  x1={CENTER}
                  y1={CENTER}
                  x2={point.x}
                  y2={point.y}
                  className="agent-network-line"
                />
              ))}
            </g>

            {/* agent -> external system connections */}
            <g className="agent-network-lines agent-network-lines--system">
              {SYSTEMS.map((system, index) => {
                const agentPoint = agentPointById.get(system.agentId);
                if (!agentPoint) return null;
                const agentIndex = AGENTS.findIndex((agent) => agent.id === system.agentId);
                const systemPoint = polarPoint(SYSTEM_RADIUS, agentIndex, AGENTS.length);
                return (
                  <line
                    key={`system-line-${system.id}`}
                    x1={agentPoint.x}
                    y1={agentPoint.y}
                    x2={systemPoint.x}
                    y2={systemPoint.y}
                    className="agent-network-line agent-network-line--system"
                    style={{ animationDelay: `${index * 0.35}s` }}
                  />
                );
              })}
            </g>

            <circle cx={CENTER} cy={CENTER} r={150} fill="url(#orchestrator-glow)" />
          </svg>

          <div className="agent-network-orchestrator">
            <Bot aria-hidden="true" />
            <span>{copy.orchestrator}</span>
          </div>

          {agentPoints.map(({ agent, point }) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                className="agent-network-node"
                style={{ "--pos-x": `${(point.x / VIEWBOX) * 100}%`, "--pos-y": `${(point.y / VIEWBOX) * 100}%` } as CSSProperties}
              >
                <Icon aria-hidden="true" />
                <span>{agent.label[language]}</span>
              </div>
            );
          })}

          {SYSTEMS.map((system) => {
            const agentIndex = AGENTS.findIndex((agent) => agent.id === system.agentId);
            const point = polarPoint(SYSTEM_RADIUS, agentIndex, AGENTS.length);
            const Icon = system.icon;
            return (
              <div
                key={system.id}
                className="agent-network-chip"
                style={{ "--pos-x": `${(point.x / VIEWBOX) * 100}%`, "--pos-y": `${(point.y / VIEWBOX) * 100}%` } as CSSProperties}
              >
                <Icon aria-hidden="true" />
                <span>{system.label[language]}</span>
              </div>
            );
          })}
        </div>
        <p className="agent-network-notice">{copy.notice}</p>
      </div>
    </section>
  );
}
