import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Check, Eye, FileText, Globe2, LogOut, Plus, Save, Trash2 } from "lucide-react";
import type { ManagedContent } from "../content/managedContent";
import type { PortfolioSite } from "../data/portfolioSites";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

type PathPart = string | number;
type EditorStatus = { tone: "idle" | "success" | "error"; message: string };

const sectionNames: Record<string, string> = {
  meta: "SEO y navegador",
  common: "Navegación",
  hero: "Hero",
  services: "Servicios",
  portfolio: "Portafolio",
  about: "Nosotros",
  tech: "Tecnologías",
  testimonials: "Testimonios",
  cta: "Llamado a la acción",
  footer: "Pie de página",
  contactModal: "Formulario de contacto",
};

function labelFromKey(key: PathPart) {
  if (typeof key === "number") return `Elemento ${key + 1}`;
  return key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}

function setNestedValue(target: Record<string, unknown>, path: PathPart[], value: unknown) {
  let cursor: unknown = target;
  path.forEach((part, index) => {
    if (index === path.length - 1) {
      (cursor as Record<PathPart, unknown>)[part] = value;
    } else {
      cursor = (cursor as Record<PathPart, unknown>)[part];
    }
  });
}

function TextFieldTree({
  value,
  path,
  onChange,
}: {
  value: unknown;
  path: PathPart[];
  onChange: (path: PathPart[], value: string) => void;
}) {
  const key = path[path.length - 1];
  if (typeof value === "string") {
    const multiline = value.length > 90 || /description|content|long|first|second|details/i.test(String(key));
    return (
      <label className="admin-field">
        <span>{labelFromKey(key)}</span>
        {multiline ? (
          <textarea value={value} rows={Math.min(5, Math.max(3, Math.ceil(value.length / 80)))} onChange={(event) => onChange(path, event.target.value)} />
        ) : (
          <input value={value} onChange={(event) => onChange(path, event.target.value)} />
        )}
      </label>
    );
  }

  if (Array.isArray(value)) {
    return (
      <fieldset className="admin-field-group">
        <legend>{labelFromKey(key)}</legend>
        <div className="admin-field-group__grid">
          {value.map((item, index) => <TextFieldTree key={`${String(key)}-${index}`} value={item} path={[...path, index]} onChange={onChange} />)}
        </div>
      </fieldset>
    );
  }

  if (value && typeof value === "object") {
    return (
      <fieldset className="admin-field-group">
        <legend>{labelFromKey(key)}</legend>
        <div className="admin-field-group__grid">
          {Object.entries(value).map(([childKey, childValue]) => (
            <TextFieldTree key={childKey} value={childValue} path={[...path, childKey]} onChange={onChange} />
          ))}
        </div>
      </fieldset>
    );
  }

  return null;
}

function emptyProject(index: number): PortfolioSite {
  return {
    id: `project-${Date.now()}-${index}`,
    enabled: false,
    url: "https://example.com",
    image: "",
    tags: [],
    copy: {
      es: { title: "Nuevo proyecto", category: "Sitio web", description: "Describe brevemente este proyecto." },
      en: { title: "New project", category: "Website", description: "Add a short project description." },
    },
  };
}

export function AdminPage() {
  const { managedContent, refreshContent } = useLanguage();
  const publicSiteUrl = import.meta.env.BASE_URL;
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [view, setView] = useState<"texts" | "projects">("texts");
  const [language, setLanguage] = useState<Language>("es");
  const [draft, setDraft] = useState<ManagedContent>(() => structuredClone(managedContent));
  const [activeSection, setActiveSection] = useState("hero");
  const [activeProject, setActiveProject] = useState(0);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<EditorStatus>({ tone: "idle", message: "" });

  useEffect(() => {
    fetch("/api/admin/session", { credentials: "include" })
      .then((response) => setAuthenticated(response.ok))
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (authenticated) setDraft(structuredClone(managedContent));
  }, [authenticated, managedContent]);

  const sections = useMemo(() => Object.keys(draft.translations[language] || {}), [draft.translations, language]);
  const selectedSection = draft.translations[language]?.[activeSection];
  const selectedProject = draft.portfolioSites[activeProject];

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "No fue posible iniciar sesión.");
      setPassword("");
      setAuthenticated(true);
      await refreshContent();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "No fue posible iniciar sesión.");
    } finally {
      setLoginBusy(false);
    }
  };

  const updateText = (path: PathPart[], value: string) => {
    setDraft((current) => {
      const next = structuredClone(current);
      setNestedValue(next.translations[language], path, value);
      return next;
    });
    setStatus({ tone: "idle", message: "Cambios sin guardar" });
  };

  const updateProject = (transform: (project: PortfolioSite) => PortfolioSite) => {
    setDraft((current) => {
      const next = structuredClone(current);
      next.portfolioSites[activeProject] = transform(next.portfolioSites[activeProject]);
      return next;
    });
    setStatus({ tone: "idle", message: "Cambios sin guardar" });
  };

  const save = async () => {
    setSaving(true);
    setStatus({ tone: "idle", message: "Guardando..." });
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "No fue posible guardar.");
      await refreshContent();
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("dts-content-updates");
        channel.postMessage({ type: "content-updated", savedAt: result.savedAt });
        channel.close();
      }
      setStatus({ tone: "success", message: "Cambios publicados" });
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "No fue posible guardar." });
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    setAuthenticated(false);
  };

  if (authenticated === null) {
    return <main className="admin-loading">Verificando acceso...</main>;
  }

  if (!authenticated) {
    return (
      <main className="admin-login">
        <a href={publicSiteUrl} className="admin-back"><ArrowLeft aria-hidden="true" /> Volver al sitio</a>
        <form className="admin-login__panel" onSubmit={handleLogin}>
          <div className="admin-login__mark">DTS</div>
          <span className="admin-kicker">Acceso privado</span>
          <h1>Panel de control</h1>
          <p>Administra el contenido público de Digital Trust Solutions.</p>
          <label className="admin-field">
            <span>Correo electrónico</span>
            <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Contraseña</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {loginError && <p className="admin-message admin-message--error" role="alert">{loginError}</p>}
          <button className="admin-primary-button" type="submit" disabled={loginBusy}>{loginBusy ? "Ingresando..." : "Ingresar"}</button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-app">
      <aside className="admin-sidebar">
        <a className="admin-brand" href={publicSiteUrl}><span>DTS</span><strong>Administración</strong></a>
        <nav aria-label="Panel de control">
          <button className={view === "texts" ? "is-active" : ""} onClick={() => setView("texts")}><FileText aria-hidden="true" /> Textos</button>
          <button className={view === "projects" ? "is-active" : ""} onClick={() => setView("projects")}><Globe2 aria-hidden="true" /> Proyectos</button>
        </nav>
        <div className="admin-sidebar__footer">
          <a href={publicSiteUrl} target="_blank" rel="noreferrer"><Eye aria-hidden="true" /> Ver sitio</a>
          <button onClick={logout}><LogOut aria-hidden="true" /> Cerrar sesión</button>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-toolbar">
          <div>
            <span className="admin-kicker">Contenido del sitio</span>
            <h1>{view === "texts" ? "Editar textos" : "Administrar proyectos"}</h1>
          </div>
          <div className="admin-toolbar__actions">
            {status.message && <span className={`admin-save-status admin-save-status--${status.tone}`}>{status.tone === "success" && <Check aria-hidden="true" />}{status.message}</span>}
            <button className="admin-primary-button" onClick={save} disabled={saving}><Save aria-hidden="true" /> {saving ? "Guardando..." : "Guardar y publicar"}</button>
          </div>
        </header>

        {view === "texts" ? (
          <div className="admin-editor-layout">
            <aside className="admin-section-list">
              <div className="admin-language-tabs" aria-label="Idioma">
                <button className={language === "es" ? "is-active" : ""} onClick={() => setLanguage("es")}>ES</button>
                <button className={language === "en" ? "is-active" : ""} onClick={() => setLanguage("en")}>EN</button>
              </div>
              {sections.map((section) => <button key={section} className={activeSection === section ? "is-active" : ""} onClick={() => setActiveSection(section)}>{sectionNames[section] || labelFromKey(section)}</button>)}
            </aside>
            <div className="admin-form-panel">
              <header><span>{language === "es" ? "Español" : "English"}</span><h2>{sectionNames[activeSection] || labelFromKey(activeSection)}</h2></header>
              {selectedSection !== undefined && <TextFieldTree value={selectedSection} path={[activeSection]} onChange={updateText} />}
            </div>
          </div>
        ) : (
          <div className="admin-project-layout">
            <aside className="admin-project-list">
              <div className="admin-project-list__header"><strong>{draft.portfolioSites.length} / 20</strong><button disabled={draft.portfolioSites.length >= 20} onClick={() => { setDraft((current) => ({ ...current, portfolioSites: [...current.portfolioSites, emptyProject(current.portfolioSites.length + 1)] })); setActiveProject(draft.portfolioSites.length); }}><Plus aria-hidden="true" /> Agregar</button></div>
              {draft.portfolioSites.map((project, index) => <button key={project.id} className={activeProject === index ? "is-active" : ""} onClick={() => setActiveProject(index)}><span className={project.enabled ? "is-published" : ""} /> <div><strong>{project.copy.es.title}</strong><small>{project.enabled ? "Publicado" : "Oculto"}</small></div></button>)}
            </aside>
            {selectedProject && (
              <div className="admin-form-panel admin-project-form">
                <header><span>Proyecto {activeProject + 1}</span><h2>{selectedProject.copy.es.title}</h2></header>
                <label className="admin-toggle"><input type="checkbox" checked={selectedProject.enabled} onChange={(event) => updateProject((project) => ({ ...project, enabled: event.target.checked }))} /><span /> Publicar en el carrusel</label>
                <div className="admin-two-columns">
                  <label className="admin-field"><span>URL del sitio</span><input type="url" value={selectedProject.url} onChange={(event) => updateProject((project) => ({ ...project, url: event.target.value }))} /></label>
                  <label className="admin-field"><span>URL de la imagen</span><input type="url" value={selectedProject.image} placeholder="https://..." onChange={(event) => updateProject((project) => ({ ...project, image: event.target.value }))} /></label>
                </div>
                <label className="admin-field"><span>Tecnologías, separadas por comas</span><input value={selectedProject.tags.join(", ")} onChange={(event) => updateProject((project) => ({ ...project, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12) }))} /></label>
                {(["es", "en"] as Language[]).map((projectLanguage) => (
                  <fieldset className="admin-field-group" key={projectLanguage}>
                    <legend>{projectLanguage === "es" ? "Contenido en español" : "English content"}</legend>
                    <div className="admin-field-group__grid">
                      <label className="admin-field"><span>Título</span><input value={selectedProject.copy[projectLanguage].title} onChange={(event) => updateProject((project) => ({ ...project, copy: { ...project.copy, [projectLanguage]: { ...project.copy[projectLanguage], title: event.target.value } } }))} /></label>
                      <label className="admin-field"><span>Categoría</span><input value={selectedProject.copy[projectLanguage].category} onChange={(event) => updateProject((project) => ({ ...project, copy: { ...project.copy, [projectLanguage]: { ...project.copy[projectLanguage], category: event.target.value } } }))} /></label>
                      <label className="admin-field"><span>Descripción</span><textarea rows={3} value={selectedProject.copy[projectLanguage].description} onChange={(event) => updateProject((project) => ({ ...project, copy: { ...project.copy, [projectLanguage]: { ...project.copy[projectLanguage], description: event.target.value } } }))} /></label>
                    </div>
                  </fieldset>
                ))}
                <button className="admin-danger-button" disabled={draft.portfolioSites.length <= 1} onClick={() => { setDraft((current) => ({ ...current, portfolioSites: current.portfolioSites.filter((_, index) => index !== activeProject) })); setActiveProject(Math.max(0, activeProject - 1)); }}><Trash2 aria-hidden="true" /> Eliminar proyecto</button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
