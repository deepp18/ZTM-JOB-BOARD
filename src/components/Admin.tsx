// src/pages/Admin.tsx
import React, { useEffect, useState } from "react";

type Job = {
  id: string;
  jobTitle: string;
  company?: string;
  location?: string;
  description?: string;
};

const STORAGE_KEY = "jobs_store_v1";

const DEMO: Job[] = [
  { id: "1", jobTitle: "Frontend Engineer", company: "Acme", location: "Bengaluru, India", description: "React + TypeScript" },
  { id: "2", jobTitle: "Backend Engineer", company: "Globex", location: "Pune, India", description: "Node.js / Express" },
];

function loadJobs(): Job[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Job[];
  } catch {
    return [];
  }
}
function saveJobs(jobs: Job[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export default function AdminPage(): JSX.Element {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState({ jobTitle: "", company: "", location: "", description: "" });
  const [query, setQuery] = useState("");

  useEffect(() => {
    const existing = loadJobs();
    if (existing.length === 0) {
      saveJobs(DEMO);
      setJobs(DEMO);
    } else {
      setJobs(existing);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  function uuid() {
    return Math.random().toString(36).slice(2, 9);
  }

  function handleAdd() {
    const j: Job = {
      id: uuid(),
      jobTitle: form.jobTitle || "Untitled",
      company: form.company,
      location: form.location,
      description: form.description,
    };
    setJobs((prev) => [j, ...prev]);
    setForm({ jobTitle: "", company: "", location: "", description: "" });
  }

  function startEdit(job: Job) {
    setEditing(job);
    setForm({ jobTitle: job.jobTitle || "", company: job.company || "", location: job.location || "", description: job.description || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyEdit() {
    if (!editing) return;
    setJobs((prev) => prev.map((j) => (j.id === editing.id ? { ...j, ...form } : j)));
    setEditing(null);
    setForm({ jobTitle: "", company: "", location: "", description: "" });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this job?")) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  function signOut() {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("admin_token");
    window.location.href = "/login";
  }

  function exportJSON() {
    const dataStr = JSON.stringify(jobs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobs-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result));
        if (Array.isArray(parsed)) {
          const ok = parsed.every((x) => x.id && x.jobTitle);
          if (!ok) throw new Error("Invalid format");
          setJobs(parsed);
        } else {
          throw new Error("Not an array");
        }
      } catch (e) {
        alert("Invalid JSON import");
      }
    };
    reader.readAsText(f);
  }

  const filtered = jobs.filter((j) =>
    (j.jobTitle || "").toLowerCase().includes(query.toLowerCase()) ||
    (j.company || "").toLowerCase().includes(query.toLowerCase()) ||
    (j.location || "").toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <div className="adm-root">Loading admin…</div>;

  return (
    <div className="adm-root">
      <style>{`
        :root{
          --bg:#0f1724;
          --card:#0b1220;
          --muted:#94a3b8;
          --accent:#60a5fa;
          --accent-2:#3b82f6;
          --glass: rgba(255,255,255,0.03);
          --success: #10b981;
          --danger: #ef4444;
        }
        .adm-root{
          min-height:100vh;
          padding:28px;
          background: linear-gradient(180deg, #071022 0%, #081227 60%), radial-gradient(800px 400px at 10% 10%, rgba(59,130,246,0.06), transparent 10%), radial-gradient(600px 300px at 90% 90%, rgba(96,165,250,0.04), transparent 10%);
          color: #e6eef8;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        }

        .adm-top {
          display:flex;
          gap:16px;
          align-items:center;
          justify-content:space-between;
          margin-bottom:18px;
        }

        .adm-brand {
          display:flex;
          gap:12px;
          align-items:center;
        }

        .logo {
          width:48px;height:48px;border-radius:10px;
          background: linear-gradient(135deg,var(--accent),var(--accent-2));
          box-shadow: 0 6px 18px rgba(59,130,246,0.16);
          display:flex;align-items:center;justify-content:center;font-weight:700;color:white;
        }
        .brand-title { font-size:18px; font-weight:700; letter-spacing: -0.2px; }
        .brand-sub { font-size:12px; color:var(--muted); margin-top:-4px; }

        .adm-actions {
          display:flex; gap:8px; align-items:center;
        }
        .btn {
          background: var(--glass);
          border: 1px solid rgba(255,255,255,0.04);
          color: var(--accent);
          padding: 8px 12px;
          border-radius: 10px;
          cursor:pointer;
          transition: all .16s ease;
          font-weight:600;
          box-shadow: none;
        }
        .btn:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(59,130,246,0.08); }
        .btn.primary {
          background: linear-gradient(90deg,var(--accent),var(--accent-2));
          color: white;
          border: none;
        }
        .btn.ghost {
          background: transparent;
          color: var(--muted);
          border: 1px dashed rgba(255,255,255,0.03);
        }
        .btn.danger {
          background: linear-gradient(90deg, rgba(239,68,68,0.12), rgba(239,68,68,0.08));
          color: var(--danger);
          border: 1px solid rgba(239,68,68,0.08);
        }

        .adm-grid {
          display:grid;
          grid-template-columns: 360px 1fr;
          gap:20px;
          align-items:start;
        }

        /* left pane (controls) */
        .panel {
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border-radius:12px;
          padding:16px;
          border: 1px solid rgba(255,255,255,0.03);
          box-shadow: 0 6px 30px rgba(2,6,23,0.6);
        }
        .panel h3 { margin:0 0 8px 0; font-size:14px; }
        .muted { color:var(--muted); font-size:13px; margin-bottom:8px; }

        .field { margin-bottom:10px; display:flex; flex-direction:column; gap:6px; }
        .field input, .field textarea {
          padding:10px 12px;
          background: rgba(255,255,255,0.02);
          border:1px solid rgba(255,255,255,0.03);
          border-radius:8px;
          color: #e6eef8;
          outline:none;
          transition: box-shadow .12s ease, border-color .12s ease;
          font-size:14px;
        }
        .field input:focus, .field textarea:focus { box-shadow: 0 6px 18px rgba(59,130,246,0.08); border-color: rgba(96,165,250,0.25); }

        .controls-row { display:flex; gap:8px; margin-top:8px; }

        /* right pane (table / list) */
        .list-panel { background: transparent; }
        .search-wrap { display:flex; gap:8px; margin-bottom:12px; align-items:center; }
        .search-wrap input {
          flex:1; padding:10px 12px; border-radius:10px; background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.03); color:#e6eef8;
        }

        .cards {
          display:grid;
          grid-template-columns: repeat(auto-fill,minmax(280px,1fr));
          gap:12px;
        }

        .job-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01));
          border-radius:12px;
          padding:14px;
          border: 1px solid rgba(255,255,255,0.03);
          transition: transform .12s ease, box-shadow .12s ease;
        }
        .job-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(2,6,23,0.6); }
        .job-title { font-weight:700; font-size:15px; margin-bottom:6px; }
        .job-meta { color:var(--muted); font-size:13px; margin-bottom:8px; }
        .job-desc { color: #cfe7ff; font-size:13px; min-height:34px; }

        .job-actions { margin-top:10px; display:flex; gap:8px; }

        /* responsive */
        @media (max-width: 880px) {
          .adm-grid { grid-template-columns: 1fr; }
          .panel { order: 2; }
          .list-panel { order: 1; }
        }
      `}</style>

      <div className="adm-top">
        <div className="adm-brand">
          <div className="logo">ZtM</div>
          <div>
            <div className="brand-title">Job Board — Admin</div>
            <div className="brand-sub">Manage listings • Local demo</div>
          </div>
        </div>

        <div className="adm-actions">
          
          <button className="btn" onClick={() => { if (confirm('Clear all jobs?')) setJobs([]); }}>Clear All</button>
          <button className="btn" onClick={exportJSON}>Export</button>
          <label className="btn" style={{ cursor: "pointer" }}>
            Import
            <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => importJSON(e.target.files)} />
          </label>
          <button className="btn danger" onClick={signOut}>Sign out</button>
        </div>
      </div>

      <div className="adm-grid">
        <aside className="panel" aria-labelledby="panel-heading">
          <h3 id="panel-heading">Create / Edit Job</h3>
          <div className="muted">Add a job or edit an existing one. Changes are stored in your browser (localStorage).</div>

          <div className="field">
            <label style={{ fontSize: 13, color: "var(--muted)" }}>Job title</label>
            <input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="e.g. Senior React Developer" />
          </div>

          <div className="field">
            <label style={{ fontSize: 13, color: "var(--muted)" }}>Company</label>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
          </div>

          <div className="field">
            <label style={{ fontSize: 13, color: "var(--muted)" }}>Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
          </div>

          <div className="field">
            <label style={{ fontSize: 13, color: "var(--muted)" }}>Short description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="One-line summary" />
          </div>

          <div className="controls-row">
            {editing ? (
              <>
                <button className="btn primary" onClick={applyEdit}>Apply edit</button>
                <button className="btn" onClick={() => { setEditing(null); setForm({ jobTitle: "", company: "", location: "", description: "" }); }}>Cancel</button>
              </>
            ) : (
              <button className="btn primary" onClick={handleAdd}>Add job</button>
            )}
          </div>
        </aside>

        <section className="list-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="search-wrap">
              <input placeholder="Search jobs, company, location..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <div style={{ color: "var(--muted)", fontSize: 13 }}>{filtered.length} results</div>
            </div>
          </div>

          <div className="cards" role="list">
            {filtered.map((job) => (
              <article key={job.id} className="job-card" role="listitem" aria-label={job.jobTitle}>
                <div className="job-title">{job.jobTitle}</div>
                <div className="job-meta">{job.company ?? "—"} • {job.location ?? "—"}</div>
                <div className="job-desc">{job.description ?? "No description"}</div>

                <div className="job-actions">
                  <button className="btn" onClick={() => startEdit(job)}>Edit</button>
                  <button className="btn" onClick={() => navigator.clipboard?.writeText(JSON.stringify(job)).then(()=>alert('Copied!'))}>Copy</button>
                  <button className="btn" onClick={() => handleDelete(job.id)}>Delete</button>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <div style={{ color: "var(--muted)", padding: 12 }}>No jobs match your search.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
