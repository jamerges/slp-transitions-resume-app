"use client";

import { useState, useEffect, useRef } from "react";
import {
  S, Card, CopyButton, Chip, ProgressBar, focusB, blurB,
} from "./ui";
import {
  ROLE_OPTIONS, NOT_SURE_OPTION, SETTING_OPTIONS, WORK_PREFERENCES,
  getRelevantStories,
} from "@/lib/companies";
import type { UserGoals } from "@/lib/prompts";

const STEPS = {
  WELCOME: 0, RESUME: 1, GOALS: 2, JOB: 3, EMAIL: 4,
  PROCESSING: 5, PREVIEW: 6, EXPLORE_RESULTS: 7, REDIRECTING: 8,
} as const;
type Step = (typeof STEPS)[keyof typeof STEPS];

async function parseFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext === "txt" || ext === "md") return await file.text();
  if (ext === "pdf") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const raw = decoder.decode(new Uint8Array(arrayBuffer));
      let text = "";
      const textRuns = raw.match(/\(([^)]+)\)/g);
      if (textRuns) text = textRuns.map(t => t.slice(1, -1)).join(" ").replace(/\\n/g, "\n").replace(/\\r/g, "").replace(/\s+/g, " ").trim();
      if (text.length > 100) return text;
      return "[Could not extract text. Use 'Paste Text' tab.]";
    } catch { return "[PDF parsing failed. Use 'Paste Text' tab.]"; }
  }
  if (ext === "docx") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await (window as any).mammoth?.convertToPlainText({ arrayBuffer });
      if (result?.value) return result.value;
      return "[Could not parse .docx. Use 'Paste Text' tab.]";
    } catch { return "[DOCX parsing failed. Use 'Paste Text' tab.]"; }
  }
  return "[Unsupported file. Use .pdf, .docx, .txt or paste text.]";
}

export default function SLPCareerSuite() {
  const [step, setStep] = useState<Step>(STEPS.WELCOME);
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [goals, setGoals] = useState<UserGoals>({
    targetRoles: [],
    settings: [],
    workPreferences: [],
    topSkills: "",
    whyLeaving: "",
    years: "",
  });
  const [jobDesc, setJobDesc] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [writingSample, setWritingSample] = useState("");
  const [writingSampleFileName, setWritingSampleFileName] = useState("");
  const [showWritingSample, setShowWritingSample] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [exploreResults, setExploreResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const writingFileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const isExploreMode = goals.targetRoles.length === 1 && goals.targetRoles[0] === NOT_SURE_OPTION;

  const loadingMsgs = [
    "Reading your resume through non-clinical eyes...",
    "Translating clinical jargon into market language...",
    "Matching your skills to the job description...",
    "Drafting your cover letter and interview prep...",
    "Polishing the final output (this takes a minute)...",
  ];
  const exploreLoadingMsgs = [
    "Analyzing your resume for transferable strengths...",
    "Cross-referencing your interests and clinical experience...",
    "Mapping you to non-clinical career paths...",
    "Building your personalized exploration report...",
  ];

  useEffect(() => {
    if (loading) {
      const msgs = isExploreMode ? exploreLoadingMsgs : loadingMsgs;
      let i = 0;
      setLoadMsg(msgs[0]);
      const iv = setInterval(() => { i = (i + 1) % msgs.length; setLoadMsg(msgs[i]); }, 4000);
      return () => clearInterval(iv);
    }
  }, [loading, isExploreMode]);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [step]);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFileError("File too large (max 5MB)"); return; }
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "docx", "txt", "md"].includes(ext)) { setFileError("Please upload .pdf, .docx, or .txt"); return; }
    setFileError("");
    setFileName(file.name);
    setResumeText(await parseFile(file));
  };

  const handleWritingSampleFile = async (file?: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    setWritingSampleFileName(file.name);
    const text = await parseFile(file);
    setWritingSample(text);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer?.files?.[0]);
  };

  const subscribeEmail = (addr: string) => {
    if (!addr || !addr.includes("@")) return;
    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: addr }),
    }).catch((err) => console.error("[subscribe] failed", err));
  };

  const generateExplore = async () => {
    setLoading(true); setStep(STEPS.PROCESSING); setError(null); setDebugInfo(null);
    try {
      const workPreferenceLabels = goals.workPreferences
        .map((id) => WORK_PREFERENCES.find((w) => w.id === id)?.label)
        .filter(Boolean) as string[];
      const resp = await fetch("/api/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, goals, workPreferenceLabels }),
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.error || `API ${resp.status}`);
      }
      const parsed = await resp.json();
      setExploreResults(parsed);
      setStep(STEPS.EXPLORE_RESULTS);
    } catch (err: any) {
      console.error(err);
      setError(`Could not generate exploration: ${err.message}`);
      setStep(STEPS.GOALS);
    } finally { setLoading(false); }
  };

  const generatePreview = async () => {
    subscribeEmail(email);
    setLoading(true); setStep(STEPS.PROCESSING); setError(null); setDebugInfo(null);
    try {
      const resp = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobTitle, jobDesc, goals }),
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.error || `API ${resp.status}`);
      }
      const parsed = await resp.json();
      setPreview(parsed);
      setStep(STEPS.PREVIEW);
    } catch (err: any) {
      console.error(err);
      setError(`Preview failed: ${err.message}`);
      setStep(STEPS.JOB);
    } finally { setLoading(false); }
  };

  const handlePaywallClick = async () => {
    setError(null); setDebugInfo(null); setStep(STEPS.REDIRECTING);
    try {
      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText, jobTitle, jobDesc, goals, email, writingSample,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.url) {
        throw new Error(data.error || `Checkout API ${resp.status}`);
      }
      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      setError(`Could not start checkout: ${err.message}. Please try again or email hello@slptransitions.com.`);
      setStep(STEPS.PREVIEW);
    }
  };

  const ErrorBanner = () =>
    error ? (
      <Card style={{ background: "var(--err-bg)", borderColor: "#FCA5A5", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--err)", marginBottom: 6 }}>⚠️ Something went wrong</div>
        <div style={{ fontSize: 13, color: "var(--err)", marginBottom: 8 }}>{error}</div>
        {debugInfo && (
          <details style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
            <summary style={{ cursor: "pointer" }}>Show technical details</summary>
            <pre style={{ marginTop: 8, padding: 8, background: "rgba(0,0,0,0.05)", borderRadius: 4, overflow: "auto", maxHeight: 120 }}>{debugInfo}</pre>
          </details>
        )}
      </Card>
    ) : null;

  const renderWelcome = () => (
    <div style={{ ...S.wrap, textAlign: "center", padding: "48px 0 20px" }}>
      <span style={S.tag}>Free Preview • No Account Required</span>
      <h1 style={{ ...S.h1, fontSize: 36, marginTop: 16 }}>Your SLP resume, translated<br />into a career you actually want.</h1>
      <p style={{ ...S.p, maxWidth: 520, margin: "0 auto 28px", fontSize: 16 }}>Upload your resume and a job description. We'll show you exactly how your clinical experience maps to non-clinical roles — in language hiring managers understand.</p>
      <button style={S.btn} onClick={() => setStep(STEPS.RESUME)}
        onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = "var(--accent-light)")}
        onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = "var(--accent)")}>
        Start Your Translation →
      </button>
      <p style={{ fontSize: 13, color: "var(--light)", marginTop: 14 }}>Takes ~3 minutes • Full package from $24</p>

      <Card style={{ marginTop: 36, textAlign: "left" }} highlight>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", marginBottom: 10 }}>What you'll get:</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
          {([
            ["✓", "Skills match score", true],
            ["✓", "3 sample bullet translations", true],
            ["⟡", "Full resume rewrite", false],
            ["⟡", "Tailored cover letter", false],
            ["⟡", "Gap analysis + action plan", false],
            ["⟡", "Interview talking points", false],
            ["⟡", "LinkedIn headline", false],
            ["⟡", "Companies hiring for your role", false],
          ] as const).map(([icon, text, free], i) => (
            <div key={i} style={{ fontSize: 14, display: "flex", gap: 8, padding: "3px 0", color: free ? "var(--text)" : "var(--muted)" }}>
              <span style={{ color: free ? "var(--accent)" : "var(--light)", flexShrink: 0 }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginTop: 8, textAlign: "left" }}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>Not sure what role you want yet?</div>
        <div style={{ fontSize: 14, color: "var(--text)" }}>
          When you get to the goals screen, select <strong style={{ color: "var(--accent)" }}>"Not sure yet — help me explore"</strong> and we'll switch to a different flow that suggests roles based on what you actually enjoy doing.
        </div>
      </Card>
    </div>
  );

  const renderResume = () => (
    <div style={S.wrap}>
      <ProgressBar step={1} total={4} />
      <h2 style={S.h2}>Let's start with your resume.</h2>
      <p style={S.p}>Upload a file or paste your resume text.</p>

      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid var(--border)" }}>
        {(["upload", "paste"] as const).map((mode) => (
          <button key={mode} onClick={() => setInputMode(mode)} style={{
            padding: "10px 20px", fontSize: 14, fontWeight: inputMode === mode ? 600 : 400,
            color: inputMode === mode ? "var(--accent)" : "var(--muted)",
            background: "none", border: "none", cursor: "pointer",
            borderBottom: inputMode === mode ? "2px solid var(--accent)" : "2px solid transparent",
            fontFamily: "'DM Sans', sans-serif",
          }}>{mode === "upload" ? "📎 Upload File" : "📋 Paste Text"}</button>
        ))}
      </div>

      {inputMode === "upload" ? (
        <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} style={{
          border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`, borderRadius: 12,
          padding: "48px 24px", textAlign: "center", background: isDragging ? "var(--accent-bg-subtle)" : "var(--card)",
          cursor: "pointer", marginBottom: 16,
        }}>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
          {fileName ? (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{fileName}</div>
              <div style={{ fontSize: 13, color: resumeText.length > 100 ? "var(--accent)" : "var(--warn)", marginTop: 4 }}>
                {resumeText.length > 100 ? `✓ ${resumeText.split(/\s+/).length} words extracted` : "⚠ Limited text — try Paste Text"}
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFileName(""); setResumeText(""); }} style={{ marginTop: 8, fontSize: 13, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif" }}>Remove</button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Drop your resume here, or click to browse</div>
              <div style={{ fontSize: 13, color: "var(--light)", marginTop: 6 }}>PDF, DOCX, or TXT • Max 5MB</div>
            </div>
          )}
        </div>
      ) : (
        <textarea style={{ ...S.textarea, minHeight: 200 }} value={resumeText} onChange={(e) => setResumeText(e.target.value)}
          placeholder={"Paste your full resume here..."} onFocus={focusB} onBlur={blurB} />
      )}

      {fileError && <div style={{ fontSize: 13, color: "var(--err)", marginBottom: 12 }}>{fileError}</div>}
      <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 20 }}>💡 Include job titles, bullet points, and metrics</p>

      <div style={{ display: "flex", gap: 12 }}>
        <button style={S.btnOut} onClick={() => setStep(STEPS.WELCOME)}>← Back</button>
        <button style={{ ...S.btn, opacity: resumeText.length < 50 ? 0.4 : 1 }} disabled={resumeText.length < 50} onClick={() => setStep(STEPS.GOALS)}>Continue →</button>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div style={S.wrap}>
      <ProgressBar step={2} total={isExploreMode ? 3 : 4} />
      <h2 style={S.h2}>Tell us about your transition.</h2>
      <p style={S.p}>This tailors the experience to your situation.</p>

      <ErrorBanner />

      <div style={{ marginBottom: 24 }}>
        <label style={S.label}>What roles interest you? (pick all that apply)</label>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {ROLE_OPTIONS.map((r) => (
            <Chip key={r} label={r} selected={goals.targetRoles.includes(r)} onClick={() => {
              setGoals((p) => ({
                ...p,
                targetRoles: p.targetRoles.includes(r)
                  ? p.targetRoles.filter((x) => x !== r)
                  : [...p.targetRoles.filter((x) => x !== NOT_SURE_OPTION), r],
              }));
            }} />
          ))}
        </div>
        <div style={{ marginTop: 8, padding: "12px 14px", background: isExploreMode ? "var(--accent-bg-subtle)" : "var(--bg)", borderRadius: 8, border: `1px solid ${isExploreMode ? "var(--accent)" : "var(--border)"}` }}>
          <Chip label={NOT_SURE_OPTION} selected={isExploreMode} onClick={() => {
            setGoals((p) => ({ ...p, targetRoles: isExploreMode ? [] : [NOT_SURE_OPTION] }));
          }} />
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Choose this and we'll suggest roles based on what you enjoy doing instead of translating for one specific job.
          </div>
        </div>
      </div>

      {isExploreMode && (
        <div style={{ marginBottom: 24, padding: 20, background: "var(--accent-bg-subtle)", borderRadius: 12, border: "1px solid var(--accent-bg)" }}>
          <label style={{ ...S.label, color: "var(--accent)", fontSize: 15, marginBottom: 4 }}>What aspects of your work do you actually enjoy?</label>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12, marginTop: 0 }}>Pick at least 3. Be honest — this is what we'll use to suggest roles that fit you.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {WORK_PREFERENCES.map((p) => {
              const sel = goals.workPreferences.includes(p.id);
              return (
                <div key={p.id} onClick={() => {
                  setGoals((prev) => ({ ...prev, workPreferences: sel ? prev.workPreferences.filter((x) => x !== p.id) : [...prev.workPreferences, p.id] }));
                }} style={{
                  padding: "10px 12px", border: `1.5px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                  background: sel ? "#fff" : "var(--card)", borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: sel ? "var(--accent)" : "var(--text)" }}>
                    {sel && "✓ "}{p.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{p.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Clinical setting(s) <span style={{ fontWeight: 400, color: "var(--light)" }}>(pick all that apply)</span></label>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {SETTING_OPTIONS.map((s) => (
            <Chip key={s} label={s} selected={goals.settings.includes(s)} onClick={() => {
              setGoals((p) => ({
                ...p,
                settings: p.settings.includes(s) ? p.settings.filter((x) => x !== s) : [...p.settings, s],
              }));
            }} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Years of experience</label>
        <input style={{ ...S.input, maxWidth: 200 }} placeholder="e.g., 5 years" value={goals.years} onChange={(e) => setGoals((p) => ({ ...p, years: e.target.value }))} onFocus={focusB} onBlur={blurB} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Skills to highlight</label>
        <textarea style={{ ...S.textarea, minHeight: 70 }} placeholder="data analysis, project management, training..." value={goals.topSkills} onChange={(e) => setGoals((p) => ({ ...p, topSkills: e.target.value }))} onFocus={focusB} onBlur={blurB} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={S.label}>Why are you transitioning? <span style={{ fontWeight: 400, color: "var(--light)" }}>(optional)</span></label>
        <textarea style={{ ...S.textarea, minHeight: 60 }} placeholder="Burnout? Curiosity? Want autonomy?" value={goals.whyLeaving} onChange={(e) => setGoals((p) => ({ ...p, whyLeaving: e.target.value }))} onFocus={focusB} onBlur={blurB} />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button style={S.btnOut} onClick={() => setStep(STEPS.RESUME)}>← Back</button>
        {isExploreMode ? (
          <button style={{ ...S.btn, opacity: goals.workPreferences.length < 3 ? 0.4 : 1 }} disabled={goals.workPreferences.length < 3} onClick={generateExplore}>Explore My Career Paths →</button>
        ) : (
          <button style={{ ...S.btn, opacity: goals.targetRoles.length === 0 ? 0.4 : 1 }} disabled={goals.targetRoles.length === 0} onClick={() => setStep(STEPS.JOB)}>Continue →</button>
        )}
      </div>
    </div>
  );

  const renderJob = () => (
    <div style={S.wrap}>
      <ProgressBar step={3} total={4} />
      <h2 style={S.h2}>Paste the job you're targeting.</h2>
      <p style={S.p}>The more specific, the better the translation.</p>

      <ErrorBanner />

      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Job title</label>
        <input style={S.input} placeholder="e.g., Customer Success Manager" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} onFocus={focusB} onBlur={blurB} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Full job description</label>
        <textarea style={{ ...S.textarea, minHeight: 200 }} placeholder="Paste the complete description..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} onFocus={focusB} onBlur={blurB} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setShowWritingSample(!showWritingSample)} style={{
          background: "none", border: "1px dashed var(--border)", borderRadius: 8,
          padding: "10px 14px", width: "100%", textAlign: "left", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
            {showWritingSample ? "▾" : "▸"} Make my cover letter sound like ME (optional)
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Upload an old cover letter or paste a writing sample — we'll match your tone and voice.
          </div>
        </button>

        {showWritingSample && (
          <div style={{ marginTop: 12, padding: 16, background: "var(--accent-bg-subtle)", borderRadius: 8 }}>
            <input ref={writingFileRef} type="file" accept=".pdf,.docx,.txt,.md" style={{ display: "none" }} onChange={(e) => handleWritingSampleFile(e.target.files?.[0])} />

            {writingSampleFileName && (
              <div style={{ fontSize: 13, color: "var(--accent)", marginBottom: 8 }}>
                ✓ {writingSampleFileName} ({writingSample.split(/\s+/).length} words)
                <button onClick={() => { setWritingSampleFileName(""); setWritingSample(""); }} style={{ marginLeft: 8, fontSize: 12, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", textDecoration: "underline" }}>Remove</button>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={() => writingFileRef.current?.click()} style={{ ...S.btnOut, fontSize: 13, padding: "6px 14px" }}>📎 Upload Sample</button>
              <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center" }}>or paste below:</span>
            </div>

            <textarea style={{ ...S.textarea, minHeight: 100, fontSize: 13 }}
              placeholder="Paste a cover letter, email, or any writing that sounds like you. We'll mirror your tone in the AI-generated cover letter."
              value={writingSample} onChange={(e) => { setWritingSample(e.target.value); if (writingSampleFileName) setWritingSampleFileName(""); }}
              onFocus={focusB} onBlur={blurB} />
            <div style={{ fontSize: 11, color: "var(--light)", marginTop: 4 }}>
              💡 Even 100-200 words is enough to capture your voice
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button style={S.btnOut} onClick={() => setStep(STEPS.GOALS)}>← Back</button>
        <button style={{ ...S.btn, opacity: (jobDesc.length < 50 || !jobTitle) ? 0.4 : 1 }} disabled={jobDesc.length < 50 || !jobTitle} onClick={() => setStep(STEPS.EMAIL)}>Continue →</button>
      </div>
    </div>
  );

  const renderEmail = () => (
    <div style={S.wrap}>
      <ProgressBar step={4} total={4} />
      <h2 style={S.h2}>Where should we send your results?</h2>
      <p style={S.p}>Email lets us send your results so you don't lose them. We'll also send our best transition resources (no spam).</p>
      <div style={{ marginBottom: 24 }}>
        <label style={S.label}>Email address</label>
        <input style={S.input} type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={focusB} onBlur={blurB} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button style={S.btnOut} onClick={() => setStep(STEPS.JOB)}>← Back</button>
        <button style={{ ...S.btn, opacity: !email.includes("@") ? 0.4 : 1 }} disabled={!email.includes("@")} onClick={generatePreview}>Generate My Free Preview →</button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div style={{ ...S.wrap, textAlign: "center", padding: "80px 0" }}>
      <div style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", margin: "0 auto 24px", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <h2 style={{ ...S.h2, marginBottom: 12 }}>{isExploreMode ? "Building your career exploration..." : "Translating your experience..."}</h2>
      <p style={{ ...S.p, maxWidth: 400, margin: "0 auto" }}>{loadMsg}</p>
      <p style={{ fontSize: 12, color: "var(--light)", marginTop: 16 }}>This takes 30-60 seconds. Don't close this window.</p>
    </div>
  );

  const renderRedirecting = () => (
    <div style={{ ...S.wrap, textAlign: "center", padding: "80px 0" }}>
      <div style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", margin: "0 auto 24px", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <h2 style={{ ...S.h2, marginBottom: 12 }}>Redirecting to secure checkout…</h2>
      <p style={{ ...S.p, maxWidth: 400, margin: "0 auto" }}>You'll be sent to Stripe to complete payment, then back here to see your results.</p>
    </div>
  );

  const renderExploreResults = () => {
    if (!exploreResults) return null;
    const { personalitySnapshot, topRoleMatches, transferableStrengths, exploratoryActions, warningQuestions } = exploreResults;

    return (
      <div style={S.wrap}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={S.tag}>Career Exploration Report</span>
          <h2 style={{ ...S.h2, marginTop: 12 }}>Your Personalized Path Forward</h2>
        </div>

        <Card highlight>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em", marginBottom: 6 }}>YOUR PROFESSIONAL SNAPSHOT</div>
          <div style={{ fontSize: 15, lineHeight: 1.7 }}>{personalitySnapshot}</div>
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 16 }}>Top Role Matches for You</h3>
          {topRoleMatches?.map((r: any, i: number) => (
            <div key={i} style={{ padding: 16, marginBottom: 12, border: "1px solid var(--border)", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{r.role}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 12, background: r.transitionDifficulty === "Easy" ? "#D1FAE5" : r.transitionDifficulty === "Moderate" ? "#FEF3C7" : "#FEE2E2", color: r.transitionDifficulty === "Easy" ? "#065F46" : r.transitionDifficulty === "Moderate" ? "#92400E" : "#991B1B" }}>{r.transitionDifficulty}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{r.matchScore}%</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8, lineHeight: 1.6 }}>{r.fit}</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "var(--muted)" }}>
                <span>💰 {r.salaryRange}</span>
                <span>📅 {r.dayInLife}</span>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 12 }}>Your Transferable Strengths</h3>
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>What you already have that the market wants:</p>
          {transferableStrengths?.map((s: any, i: number) => (
            <div key={i} style={{ padding: "12px 14px", background: "var(--accent-bg-subtle)", borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>{s.strength}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}><strong style={{ color: "var(--text)" }}>Where it shows up:</strong> {s.evidence}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}><strong style={{ color: "var(--text)" }}>How to sell it:</strong> {s.sellsAs}</div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 12 }}>🎯 Try This Week</h3>
          {exploratoryActions?.map((a: any, i: number) => (
            <div key={i} style={{ padding: "10px 0 10px 14px", borderLeft: "2px solid var(--accent)", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{a.action} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--light)" }}>· {a.timeNeeded}</span></div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{a.why}</div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ ...S.h3, marginBottom: 12 }}>Honest Questions to Sit With</h3>
          <p style={{ fontSize: 13, color: "var(--light)", marginBottom: 12 }}>Before you commit to a direction:</p>
          {warningQuestions?.map((q: string, i: number) => (
            <div key={i} style={{ fontSize: 14, padding: "10px 14px", background: "var(--warn-bg)", borderRadius: 8, marginBottom: 8, color: "var(--text)", lineHeight: 1.6 }}>
              {q}
            </div>
          ))}
        </Card>

        <Card style={{ textAlign: "center", border: "1.5px solid var(--accent)", background: "linear-gradient(135deg, var(--accent-bg-subtle) 0%, #fff 100%)" }}>
          <h3 style={{ ...S.h2, fontSize: 22, marginBottom: 8 }}>Found a role that interests you?</h3>
          <p style={{ ...S.p, maxWidth: 440, margin: "0 auto 16px" }}>Once you've narrowed in, come back and run the Resume Translator on a real job posting to get a tailored resume, cover letter, and interview prep.</p>
          <button style={S.btn} onClick={() => {
            setGoals((p) => ({ ...p, targetRoles: [], workPreferences: [] }));
            setExploreResults(null);
            setStep(STEPS.GOALS);
          }}>Translate for a Specific Role →</button>
        </Card>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button style={{ ...S.btnOut, fontSize: 13 }} onClick={() => { setStep(STEPS.WELCOME); setExploreResults(null); }}>← Start over</button>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    if (!preview) return null;
    const { matchScore, matchLevel, snapshot, translatedBullets, quickWins, fullVersionIncludes } = preview;
    const stories = getRelevantStories({ targetRoles: goals.targetRoles, jobTitle });

    return (
      <div style={S.wrap}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={S.tag}>Free Preview</span>
          <h2 style={{ ...S.h2, marginTop: 12 }}>Your SLP → {jobTitle} Translation</h2>
        </div>

        <ErrorBanner />

        <Card highlight>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, fontWeight: 700, color: "var(--accent)", fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1 }}>{matchScore}%</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>{matchLevel}</div>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>{snapshot}</p>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ ...S.h3, margin: 0 }}>Sample Bullet Translations</h3>
            <CopyButton text={translatedBullets?.map((b: any) => b.translated).join("\n\n")} label="Copy all" />
          </div>
          {translatedBullets?.map((b: any, i: number) => (
            <div key={i} style={{ marginBottom: i < translatedBullets.length - 1 ? 20 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--light)", marginBottom: 4, letterSpacing: "0.04em" }}>BEFORE</div>
              <div style={{ fontSize: 14, color: "var(--muted)", padding: "8px 12px", background: "#F9FAFB", borderRadius: 6, marginBottom: 8, borderLeft: "3px solid var(--border)", lineHeight: 1.6 }}>{b.original}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 4, letterSpacing: "0.04em" }}>AFTER</div>
              <div style={{ fontSize: 14, color: "var(--text)", padding: "8px 12px", background: "var(--accent-bg-subtle)", borderRadius: 6, borderLeft: "3px solid var(--accent)", lineHeight: 1.6, fontWeight: 500 }}>{b.translated}</div>
              {i < translatedBullets.length - 1 && <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />}
            </div>
          ))}
        </Card>

        {quickWins?.length > 0 && (
          <Card>
            <h3 style={{ ...S.h3, marginBottom: 10 }}>🎯 Do This Week</h3>
            {quickWins.map((w: string, i: number) => (
              <div key={i} style={{ fontSize: 14, color: "var(--text)", padding: "6px 0 6px 12px", borderLeft: "2px solid var(--accent)", marginBottom: 8, lineHeight: 1.6 }}>{w}</div>
            ))}
          </Card>
        )}

        {stories.length > 0 && (
          <Card>
            <h3 style={{ ...S.h3, marginBottom: 10 }}>SLPs who made similar transitions</h3>
            {stories.map((s, i) => (
              <div key={i} style={{ padding: "10px 14px", background: i % 2 === 0 ? "var(--accent-bg-subtle)" : "#F9FAFB", borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}: {s.from} → {s.to}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic", marginTop: 4 }}>"{s.quote}"</div>
              </div>
            ))}
          </Card>
        )}

        <Card style={{ textAlign: "center", border: "1.5px solid var(--accent)", background: "linear-gradient(135deg, var(--accent-bg-subtle) 0%, #fff 100%)" }}>
          <h3 style={{ ...S.h2, fontSize: 22, marginBottom: 8 }}>Get the full translation package</h3>
          <p style={{ ...S.p, maxWidth: 440, margin: "0 auto 16px" }}>Every bullet rewritten, cover letter, gap analysis, interview prep, LinkedIn headline, and companies hiring — all for this exact role.</p>
          {fullVersionIncludes?.map((item: string, i: number) => (
            <div key={i} style={{ fontSize: 14, padding: "3px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text)" }}>
              <span style={{ color: "var(--accent)" }}>✓</span> {item}
            </div>
          ))}
          <button style={{ ...S.btn, padding: "14px 40px", fontSize: 16, marginTop: 20 }} onClick={handlePaywallClick}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = "var(--accent-light)")}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = "var(--accent)")}>
            Get Full Results — $24
          </button>
          <p style={{ fontSize: 12, color: "var(--light)", marginTop: 8 }}>Secure checkout via Stripe. We'll email your full package.</p>
        </Card>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button style={{ ...S.btnOut, fontSize: 13 }} onClick={() => { setStep(STEPS.RESUME); setPreview(null); setError(null); }}>← Start over</button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div ref={topRef} />
      {step === STEPS.WELCOME && renderWelcome()}
      {step === STEPS.RESUME && renderResume()}
      {step === STEPS.GOALS && renderGoals()}
      {step === STEPS.JOB && renderJob()}
      {step === STEPS.EMAIL && renderEmail()}
      {step === STEPS.PROCESSING && renderProcessing()}
      {step === STEPS.PREVIEW && renderPreview()}
      {step === STEPS.EXPLORE_RESULTS && renderExploreResults()}
      {step === STEPS.REDIRECTING && renderRedirecting()}
    </>
  );
}
