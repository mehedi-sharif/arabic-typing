import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

function fmt(secs) {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function StatsPage({ onBack, isMobile }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        setLogs(data || []);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  // ── Derived summary stats ──────────────────────────────────────────────
  const totalSessions = logs.length;
  const totalSeconds = logs.reduce((s, l) => s + (l.duration_seconds || 0), 0);
  const avgWpm =
    totalSessions > 0
      ? Math.round(logs.reduce((s, l) => s + (l.wpm || 0), 0) / totalSessions)
      : 0;
  const avgAcc =
    totalSessions > 0
      ? Math.round(logs.reduce((s, l) => s + (l.accuracy || 0), 0) / totalSessions)
      : 0;

  // ── Per-lesson breakdown ───────────────────────────────────────────────
  const byLesson = {};
  logs.forEach((l) => {
    const key = l.lesson_id;
    if (!byLesson[key]) {
      byLesson[key] = {
        id: l.lesson_id,
        title: l.lesson_title,
        titleEn: l.lesson_title_en,
        type: l.lesson_type,
        count: 0,
        totalSecs: 0,
        bestWpm: 0,
        totalAcc: 0,
      };
    }
    const b = byLesson[key];
    b.count++;
    b.totalSecs += l.duration_seconds || 0;
    b.bestWpm = Math.max(b.bestWpm, l.wpm || 0);
    b.totalAcc += l.accuracy || 0;
  });
  const lessonList = Object.values(byLesson).sort((a, b) => b.count - a.count);

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
    color: "#f1f5f9",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Arabic', sans-serif",
    padding: isMobile ? "12px 8px" : "24px",
    boxSizing: "border-box",
  };

  const cardStyle = {
    background: "rgba(30, 41, 59, 0.8)",
    backdropFilter: "blur(12px)",
    borderRadius: isMobile ? 12 : 16,
    padding: isMobile ? 16 : 32,
    maxWidth: 900,
    margin: "0 auto",
    border: "1px solid rgba(148, 163, 184, 0.1)",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isMobile ? 20 : 28 }}>
          <button
            onClick={onBack}
            style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 8, padding: isMobile ? "6px 10px" : "8px 16px", fontSize: isMobile ? 11 : 13, cursor: "pointer", flexShrink: 0 }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 800, background: "linear-gradient(135deg, #3b82f6, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Activity Log
            </h1>
            <p style={{ margin: 0, fontSize: isMobile ? 11 : 13, color: "#64748b" }}>Your typing practice history</p>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            Loading your activity...
          </div>
        )}

        {error && (
          <div style={{ background: "#450a0a", border: "1px solid #ef444433", borderRadius: 10, padding: 16, color: "#fca5a5", fontSize: 13 }}>
            Failed to load data: {error}
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ color: "#64748b", fontSize: isMobile ? 14 : 16 }}>No activity yet.</div>
            <div style={{ color: "#475569", fontSize: isMobile ? 12 : 14, marginTop: 4 }}>Complete a lesson to start tracking!</div>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <>
            {/* ── Summary cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 8 : 12, marginBottom: isMobile ? 20 : 28 }}>
              {[
                { icon: "🗓️", label: "Sessions", value: totalSessions, color: "#3b82f6" },
                { icon: "⏱️", label: "Total Time", value: fmt(totalSeconds), color: "#8b5cf6" },
                { icon: "⚡", label: "Avg WPM", value: avgWpm, color: "#10b981" },
                { icon: "🎯", label: "Avg Accuracy", value: `${avgAcc}%`, color: avgAcc >= 90 ? "#10b981" : avgAcc >= 70 ? "#f59e0b" : "#ef4444" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#0f172a", borderRadius: isMobile ? 10 : 14, padding: isMobile ? "12px 10px" : "18px 20px", border: `1px solid ${s.color}33`, textAlign: "center" }}>
                  <div style={{ fontSize: isMobile ? 22 : 28, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: isMobile ? 9 : 11, color: "#64748b", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── Per-lesson breakdown ── */}
            <h2 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#e2e8f0", margin: `0 0 ${isMobile ? 10 : 14}px` }}>
              📚 Lessons Practiced
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8, marginBottom: isMobile ? 20 : 28 }}>
              {lessonList.map((l) => (
                <div
                  key={l.id}
                  style={{ background: "#0f172a", borderRadius: isMobile ? 10 : 12, padding: isMobile ? "10px 12px" : "14px 18px", border: `1px solid ${l.type === "hard" ? "#7c3aed33" : "#1e293b"}`, display: "flex", alignItems: "center", gap: isMobile ? 10 : 14 }}
                >
                  <div style={{ fontSize: isMobile ? 20 : 26, flexShrink: 0 }}>
                    {l.type === "hard" ? "🔥" : "📝"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Noto Sans Arabic', sans-serif", direction: "rtl" }}>{l.title}</span>
                      <span style={{ fontSize: isMobile ? 10 : 12, color: "#64748b" }}>{l.titleEn}</span>
                      {l.type === "hard" && <span style={{ fontSize: isMobile ? 9 : 10, background: "#2e1065", color: "#a78bfa", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>HARD</span>}
                    </div>
                    <div style={{ fontSize: isMobile ? 9 : 11, color: "#475569", marginTop: 2 }}>
                      {fmt(l.totalSecs)} practiced
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: isMobile ? 8 : 14, flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, color: "#3b82f6" }}>{l.count}×</div>
                      <div style={{ fontSize: isMobile ? 8 : 10, color: "#64748b" }}>sessions</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, color: "#10b981" }}>{l.bestWpm}</div>
                      <div style={{ fontSize: isMobile ? 8 : 10, color: "#64748b" }}>best WPM</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, color: "#f59e0b" }}>{Math.round(l.totalAcc / l.count)}%</div>
                      <div style={{ fontSize: isMobile ? 8 : 10, color: "#64748b" }}>avg acc</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Recent sessions ── */}
            <h2 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#e2e8f0", margin: `0 0 ${isMobile ? 10 : 14}px` }}>
              🕒 Recent Sessions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 4 : 6 }}>
              {logs.slice(0, 30).map((log) => (
                <div
                  key={log.id}
                  style={{ background: "#0f172a", borderRadius: isMobile ? 8 : 10, padding: isMobile ? "8px 10px" : "10px 16px", border: "1px solid #1e293b", display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}
                >
                  <div style={{ fontSize: isMobile ? 16 : 20, flexShrink: 0 }}>
                    {log.lesson_type === "hard" ? "🔥" : "📝"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Noto Sans Arabic', sans-serif", direction: "rtl", display: "inline" }}>{log.lesson_title}</div>
                    <span style={{ fontSize: isMobile ? 10 : 11, color: "#64748b", marginRight: 6 }}> · {log.lesson_title_en}</span>
                    <div style={{ fontSize: isMobile ? 9 : 10, color: "#475569", marginTop: 2 }}>
                      {fmtDate(log.created_at)} at {fmtTime(log.created_at)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: isMobile ? 6 : 10, flexShrink: 0 }}>
                    <span style={{ fontSize: isMobile ? 11 : 13, color: "#3b82f6", fontWeight: 600 }}>{log.wpm} WPM</span>
                    <span style={{ fontSize: isMobile ? 11 : 13, color: log.accuracy >= 90 ? "#10b981" : log.accuracy >= 70 ? "#f59e0b" : "#ef4444", fontWeight: 600 }}>{log.accuracy}%</span>
                    <span style={{ fontSize: isMobile ? 11 : 13, color: "#64748b" }}>{fmt(log.duration_seconds)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
