import { useState, useRef, useCallback } from "react";

const MACHINES = [
  { no: 5,  name: "Claw Boy 5",              code: "Z3-018", size: "S",   capacity: 60  },
  { no: 6,  name: "Claw Boy 6",              code: "Z3-022", size: "S",   capacity: 60  },
  { no: 7,  name: "Claw Boy 7",              code: "Z3-021", size: "S",   capacity: 60  },
  { no: 8,  name: "Claw Boy 8",              code: "Z3-020", size: "S",   capacity: 60  },
  { no: 9,  name: "The Bear Haunt 9",        code: "Z3-019", size: "S",   capacity: 60  },
  { no: 10, name: "The Bear Haunt 10",       code: "FDL",    size: "S",   capacity: 60  },
  { no: 11, name: "The Bear Haunt 11",       code: "FDL",    size: "S",   capacity: 0   },
  { no: 12, name: "Happy Moment 12",         code: "FDL",    size: "S",   capacity: 0   },
  { no: 13, name: "Super Doll 15",           code: "Z3-010", size: "S",   capacity: 60  },
  { no: 14, name: "Super Doll 16",           code: "Z2-016", size: "S",   capacity: 60  },
  { no: 15, name: "Super Doll 17",           code: "Z2-014", size: "S",   capacity: 60  },
  { no: 16, name: "Super Doll 18",           code: "Z2-014", size: "S",   capacity: 60  },
  { no: 17, name: "Claw Boy 23",             code: "-",      size: "S",   capacity: 60  },
  { no: 18, name: "Claw Boy 24",             code: "New 5",  size: "S",   capacity: 60  },
  { no: 19, name: "Good Mood (Yellow) 19",   code: "Z3-008", size: "L",   capacity: 18  },
  { no: 20, name: "Good Mood (Pink) 20",     code: "Z3-007", size: "L",   capacity: 18  },
  { no: 21, name: "Good Mood (Blue) 21",     code: "Z3-009", size: "L",   capacity: 18  },
  { no: 22, name: "Good Mood (Red) 22",      code: "Z3-023", size: "M",   capacity: 60  },
  { no: 23, name: "Pink Date (1)",           code: "Z3-015", size: "XXL", capacity: 1   },
  { no: 24, name: "Pink Date (2)",           code: "Z3-016", size: "XXL", capacity: 1   },
  { no: 25, name: "Happy Hour (1)",          code: "Z2-029", size: "KC",  capacity: 80  },
  { no: 26, name: "Happy Hour (2)",          code: "Z2-030", size: "KC",  capacity: 50  },
  { no: 27, name: "Clip it (2)",             code: "Z2-025", size: "KC",  capacity: 24  },
  { no: 28, name: "Claw Machine (Cat 1)",    code: "Z2-027", size: "KC",  capacity: 12  },
  { no: 29, name: "Claw Machine (Cat 2)",    code: "Z2-026", size: "KC",  capacity: 12  },
  { no: 30, name: "Claw Machine (Cat 3)",    code: "Z2-023", size: "KC",  capacity: 12  },
  { no: 31, name: "Claw Machine (Cat 4)",    code: "-",      size: "KC",  capacity: 12  },
  { no: 32, name: "Claw Machine (Cat 5)",    code: "Z2-022", size: "KC",  capacity: 24  },
  { no: 33, name: "GIR Bear",               code: "-",      size: "KC",  capacity: 58  },
  { no: 34, name: "Happy Box",              code: "Z2-011", size: "HB",  capacity: 180 },
  { no: 35, name: "Claw Boy 1",             code: "Z2-012", size: "BB",  capacity: 60  },
  { no: 36, name: "Claw Boy 2",             code: "-",      size: "BB",  capacity: 60  },
  { no: 37, name: "Claw Boy 3",             code: "-",      size: "BB",  capacity: 60  },
  { no: 38, name: "Claw Boy 4",             code: "-",      size: "BB",  capacity: 60  },
];

function createEmptyRow(m) {
  return {
    no: m.no, name: m.name, code: m.code, size: m.size, capacity: m.capacity,
    yesterday: "", catch: "", today: "", refill: "", final: "",
    playYesterday: "", playToday: "", recordedCoins: "", actualCoins: "",
    coinsLost: "", coinsOver: "", auditYesterday: "", auditToday: "", auditCount: "",
    remark: ""
  };
}

const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}-${d.toLocaleString('en',{month:'short'})}-${String(d.getFullYear()).slice(-2)}`;
};

const CATEGORY_LABELS = {
  "S": "Doll (Size S)", "M": "Doll (Size M)", "L": "Doll (Size L)",
  "XXL": "Doll (Size XXL)", "KC": "Keychain", "HB": "Happy Box", "BB": "Blind Box"
};

const COLORS = {
  S: "#f59e0b", M: "#10b981", L: "#3b82f6", XXL: "#8b5cf6",
  KC: "#ec4899", HB: "#f97316", BB: "#06b6d4"
};

export default function ClawMachineDailyReport() {
  const [tab, setTab] = useState("entry");
  const [date, setDate] = useState(todayStr());
  const [staffName, setStaffName] = useState("Net Net");
  const [manager, setManager] = useState("Srey Keo");
  const [rows, setRows] = useState(MACHINES.map(createEmptyRow));
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();

  const updateRow = (no, field, val) => {
    setRows(prev => prev.map(r => {
      if (r.no !== no) return r;
      const updated = { ...r, [field]: val };
      if (field === "yesterday" || field === "catch") {
        const y = parseFloat(updated.yesterday) || 0;
        const c = parseFloat(updated.catch) || 0;
        updated.today = String(y - c);
        updated.refill = String(c);
        updated.final = String(r.capacity || y);
      }
      if (field === "playYesterday" || field === "playToday") {
        const py = parseFloat(updated.playYesterday) || 0;
        const pt = parseFloat(updated.playToday) || 0;
        updated.recordedCoins = String(pt - py);
      }
      if (field === "auditYesterday" || field === "auditToday") {
        const ay = parseFloat(updated.auditYesterday) || 0;
        const at = parseFloat(updated.auditToday) || 0;
        updated.auditCount = String(at - ay);
      }
      if ((field === "recordedCoins" || field === "actualCoins") && updated.recordedCoins && updated.actualCoins) {
        const rc = parseFloat(updated.recordedCoins) || 0;
        const ac = parseFloat(updated.actualCoins) || 0;
        const diff = ac - rc;
        updated.coinsLost = diff < 0 ? String(Math.abs(diff)) : "0";
        updated.coinsOver = diff > 0 ? String(diff) : "0";
      }
      return updated;
    }));
  };

  const handleScan = async (file) => {
    if (!file) return;
    setScanning(true);
    setScanMsg("Reading image...");
    setImagePreview(URL.createObjectURL(file));
    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      setScanMsg("AI scanning report...");
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 } },
              { type: "text", text: `This is a daily claw machine stock report. Extract all machine data you can see.
Return ONLY a JSON array. No markdown. No backticks. Each object: 
{ "no": number, "yesterday": number, "catch": number, "today": number, "refill": number, "final": number, "playYesterday": number, "playToday": number, "recordedCoins": number, "actualCoins": number, "coinsLost": number, "coinsOver": number, "auditYesterday": number, "auditToday": number, "auditCount": number, "remark": string }
Only include rows where you can clearly read the machine number. Use null for any value you cannot read.` }
            ]
          }]
        })
      });
      const data = await resp.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(text.trim());
      if (Array.isArray(parsed)) {
        setRows(prev => prev.map(r => {
          const found = parsed.find(p => p.no === r.no);
          if (!found) return r;
          const merged = { ...r };
          Object.keys(found).forEach(k => {
            if (k !== "no" && found[k] != null) merged[k] = String(found[k]);
          });
          return merged;
        }));
        setScanMsg(`✅ Scanned! ${parsed.length} machine rows detected.`);
      } else {
        setScanMsg("⚠️ Could not parse AI response. Please enter manually.");
      }
    } catch (e) {
      setScanMsg("⚠️ Scan failed: " + e.message);
    }
    setScanning(false);
  };

  const dollRows = rows.filter(r => ["S","M","L","XXL"].includes(r.size));
  const kcRows   = rows.filter(r => r.size === "KC");
  const hbRows   = rows.filter(r => r.size === "HB");
  const bbRows   = rows.filter(r => r.size === "BB");

  const totalDollsUsed = dollRows.reduce((s, r) => s + (parseFloat(r.catch) || 0), 0);
  const totalCoins     = rows.reduce((s, r) => s + (parseFloat(r.actualCoins) || 0), 0);
  const totalPlays     = rows.reduce((s, r) => {
    const y = parseFloat(r.playYesterday) || 0;
    const t = parseFloat(r.playToday) || 0;
    return s + Math.max(0, t - y);
  }, 0);

  const ranked = [...rows]
    .filter(r => parseFloat(r.actualCoins) > 0)
    .sort((a, b) => (parseFloat(b.actualCoins) || 0) - (parseFloat(a.actualCoins) || 0))
    .slice(0, 3);

  const groupedRows = Object.entries(CATEGORY_LABELS).map(([size, label]) => ({
    size, label, rows: rows.filter(r => r.size === size)
  })).filter(g => g.rows.length > 0);

  const InputCell = ({ no, field, placeholder = "" }) => (
    <input
      type="number"
      placeholder={placeholder}
      value={rows.find(r => r.no === no)?.[field] ?? ""}
      onChange={e => updateRow(no, field, e.target.value)}
      style={{
        width: "100%", background: "#0f1117", border: "1px solid #2a2d3a",
        borderRadius: 4, color: "#e2e8f0", padding: "4px 6px",
        fontSize: 12, textAlign: "center", outline: "none"
      }}
    />
  );

  return (
    <div style={{
      fontFamily: "'DM Mono', 'Courier New', monospace",
      background: "#080b12", minHeight: "100vh", color: "#e2e8f0",
      padding: "0 0 40px"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0d1117 0%, #131b2e 100%)",
        borderBottom: "1px solid #1e293b",
        padding: "20px 24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20
          }}>🧸</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>
              CLAW MACHINE DAILY REPORT
            </div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2 }}>
              STOCK · COINS · REVENUE TRACKER
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 10, color: "#64748b", letterSpacing: 1 }}>DATE</label>
            <input value={date} onChange={e => setDate(e.target.value)}
              style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#f59e0b", padding: "6px 12px", fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 10, color: "#64748b", letterSpacing: 1 }}>STAFF</label>
            <input value={staffName} onChange={e => setStaffName(e.target.value)}
              style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0", padding: "6px 12px", fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 10, color: "#64748b", letterSpacing: 1 }}>MANAGER</label>
            <input value={manager} onChange={e => setManager(e.target.value)}
              style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0", padding: "6px 12px", fontSize: 13, outline: "none" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1e293b", background: "#0d1117" }}>
        {[["entry","📋 Entry"], ["summary","📊 Summary"], ["top3","🏆 Top 3"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: "12px 24px", background: "none", border: "none",
            color: tab === k ? "#f59e0b" : "#64748b", cursor: "pointer",
            fontSize: 13, fontWeight: tab === k ? 700 : 400,
            borderBottom: tab === k ? "2px solid #f59e0b" : "2px solid transparent",
            letterSpacing: 1, fontFamily: "inherit"
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "20px 16px" }}>
        {tab === "entry" && (
          <div>
            <div style={{
              background: "linear-gradient(135deg, #1e293b, #0f2240)",
              border: "1px dashed #3b5bdb", borderRadius: 12,
              padding: 20, marginBottom: 24, textAlign: "center"
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 12 }}>
                Scan your handwritten counting report to auto-fill the form
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => handleScan(e.target.files[0])} />
              <button onClick={() => fileRef.current.click()} disabled={scanning}
                style={{
                  background: scanning ? "#1e293b" : "linear-gradient(135deg, #3b5bdb, #7048e8)",
                  border: "none", borderRadius: 8, color: "#fff", padding: "10px 28px",
                  fontSize: 13, cursor: scanning ? "not-allowed" : "pointer", fontFamily: "inherit",
                  fontWeight: 600, letterSpacing: 1
                }}>
                {scanning ? "⏳ Scanning..." : "📸 Upload Photo to Scan"}
              </button>
              {scanMsg && (
                <div style={{ marginTop: 12, fontSize: 12, color: scanMsg.startsWith("✅") ? "#10b981" : "#f59e0b" }}>
                  {scanMsg}
                </div>
              )}
              {imagePreview && (
                <img src={imagePreview} alt="scan" style={{ marginTop: 12, maxHeight: 120, borderRadius: 8, border: "1px solid #334155" }} />
              )}
            </div>

            {groupedRows.map(({ size, label, rows: catRows }) => (
              <div key={size} style={{ marginBottom: 32 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 12
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: COLORS[size]
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: COLORS[size] }}>
                    {label.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 11, color: "#475569" }}>— {catRows.length} machines</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: "#0d1117" }}>
                        {['#','Machine','Yesterday','Catch','Today','Refill','Final','Play Yesterday','Play Today','Coins Recorded','Coins Actual','Lost','Over','Audit Yest','Audit Today','Audit Diff','Remark'].map(h => (
                          <th key={h} style={{
                            padding: "8px 6px", textAlign: "center", color: "#64748b",
                            letterSpacing: 0.5, fontWeight: 600, borderBottom: "1px solid #1e293b",
                            whiteSpace: "nowrap", fontSize: 10
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {catRows.map((r, i) => (
                        <tr key={r.no} style={{ background: i % 2 === 0 ? "#0a0e16" : "#0d1117" }}>
                          <td style={{ padding: "4px 6px", textAlign: "center", color: COLORS[size], fontWeight: 700 }}>{r.no}</td>
                          <td style={{ padding: "4px 8px", color: "#94a3b8", whiteSpace: "nowrap", fontSize: 10 }}>{r.name}</td>
                          {['yesterday','catch','today','refill','final','playYesterday','playToday','recordedCoins','actualCoins','coinsLost','coinsOver','auditYesterday','auditToday','auditCount'].map(f => (
                            <td key={f} style={{ padding: "3px 4px", minWidth: 55 }}>
                              <InputCell no={r.no} field={f} />
                            </td>
                          ))}
                          <td style={{ padding: "3px 4px", minWidth: 80 }}>
                            <input value={r.remark} onChange={e => updateRow(r.no, "remark", e.target.value)}
                              placeholder="remark"
                              style={{ width: "100%", background: "#0f1117", border: "1px solid #2a2d3a", borderRadius: 4, color: "#94a3b8", padding: "4px 6px", fontSize: 11, outline: "none" }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "#131b2e" }}>
                        <td colSpan={2} style={{ padding: "6px 8px", color: "#f59e0b", fontWeight: 700, fontSize: 11 }}>TOTAL</td>
                        {['yesterday','catch','today','refill','final','playYesterday','playToday','recordedCoins','actualCoins','coinsLost','coinsOver','auditYesterday','auditToday','auditCount'].map(f => {
                          const sum = catRows.reduce((s, r) => s + (parseFloat(r[f]) || 0), 0);
                          return (
                            <td key={f} style={{ padding: "6px 4px", textAlign: "center", color: "#f59e0b", fontWeight: 700, fontSize: 11 }}>
                              {sum > 0 ? sum : ""}
                            </td>
                          );
                        })}
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "summary" && (
          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20, letterSpacing: 1 }}>
              DATE: <span style={{ color: "#f59e0b" }}>{date}</span> &nbsp;|&nbsp; 
              STAFF: <span style={{ color: "#e2e8f0" }}>{staffName}</span> &nbsp;|&nbsp; 
              MANAGER: <span style={{ color: "#e2e8f0" }}>{manager}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Total Dolls Used", value: totalDollsUsed, icon: "🧸", color: "#f59e0b" },
                { label: "Total Coins Collected", value: totalCoins, icon: "🪙", color: "#10b981" },
                { label: "Total Plays Today", value: totalPlays, icon: "🎮", color: "#3b82f6" },
                { label: "Machines Active", value: rows.filter(r => parseFloat(r.actualCoins) > 0).length, icon: "⚡", color: "#8b5cf6" },
              ].map(kpi => (
                <div key={kpi.label} style={{
                  background: "linear-gradient(135deg, #131b2e, #0d1117)",
                  border: `1px solid ${kpi.color}33`,
                  borderRadius: 12, padding: "18px 20px"
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{kpi.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: kpi.color }}>{kpi.value.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, marginTop: 4 }}>{kpi.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, letterSpacing: 2, color: "#64748b", marginBottom: 16 }}>BY CATEGORY</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                {groupedRows.map(({ size, label, rows: catRows }) => {
                  const totalCatch = catRows.reduce((s, r) => s + (parseFloat(r.catch) || 0), 0);
                  const totalCoinscat = catRows.reduce((s, r) => s + (parseFloat(r.actualCoins) || 0), 0);
                  const totalPlayscat = catRows.reduce((s, r) => {
                    const y = parseFloat(r.playYesterday) || 0;
                    const t = parseFloat(r.playToday) || 0;
                    return s + Math.max(0, t - y);
                  }, 0);
                  return (
                    <div key={size} style={{
                      background: "#0d1117", border: `1px solid ${COLORS[size]}33`,
                      borderRadius: 10, padding: 16
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[size] }} />
                        <span style={{ color: COLORS[size], fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>{label}</span>
                        <span style={{ color: "#475569", fontSize: 10 }}>({catRows.length})</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {[ ["Caught", totalCatch], ["Coins", totalCoinscat], ["Plays", totalPlayscat] ].map(([l, v]) => (
                          <div key={l} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{v.toLocaleString()}</div>
                            <div style={{ fontSize: 10, color: "#64748b" }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, letterSpacing: 2, color: "#64748b", marginBottom: 12 }}>ALL MACHINES — COINS DETAIL</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#0d1117" }}>
                      {['#','Machine','Size','Dolls Caught','Plays','Coins Recorded','Coins Actual','Lost','Over','Remark'].map(h => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", letterSpacing: 0.5, borderBottom: "1px solid #1e293b", whiteSpace: "nowrap", fontSize: 10 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.filter(r => parseFloat(r.actualCoins) > 0 || parseFloat(r.catch) > 0).map((r, i) => {
                      const plays = Math.max(0, (parseFloat(r.playToday)||0) - (parseFloat(r.playYesterday)||0));
                      return (
                        <tr key={r.no} style={{ background: i % 2 === 0 ? "#080b12" : "#0d1117" }}>
                          <td style={{ padding: "6px 10px", color: COLORS[r.size], fontWeight: 700 }}>{r.no}</td>
                          <td style={{ padding: "6px 10px", color: "#94a3b8" }}>{r.name}</td>
                          <td style={{ padding: "6px 10px" }}>
                            <span style={{ background: `${COLORS[r.size]}22`, color: COLORS[r.size], padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{r.size}</span>
                          </td>
                          <td style={{ padding: "6px 10px", color: "#e2e8f0" }}>{r.catch || "-"}</td>
                          <td style={{ padding: "6px 10px", color: "#e2e8f0" }}>{plays || "-"}</td>
                          <td style={{ padding: "6px 10px", color: "#64748b" }}>{r.recordedCoins || "-"}</td>
                          <td style={{ padding: "6px 10px", color: "#10b981", fontWeight: 700 }}>{r.actualCoins || "-"}</td>
                          <td style={{ padding: "6px 10px", color: r.coinsLost > 0 ? "#ef4444" : "#64748b" }}>{r.coinsLost || "-"}</td>
                          <td style={{ padding: "6px 10px", color: r.coinsOver > 0 ? "#10b981" : "#64748b" }}>{r.coinsOver || "-"}</td>
                          <td style={{ padding: "6px 10px", color: "#64748b", fontSize: 10 }}>{r.remark || ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "#131b2e" }}>
                      <td colSpan={3} style={{ padding: "8px 10px", color: "#f59e0b", fontWeight: 700 }}>TOTAL</td>
                      <td style={{ padding: "8px 10px", color: "#f59e0b", fontWeight: 700 }}>{rows.reduce((s,r) => s+(parseFloat(r.catch)||0),0)}</td>
                      <td style={{ padding: "8px 10px", color: "#f59e0b", fontWeight: 700 }}>{totalPlays}</td>
                      <td style={{ padding: "8px 10px", color: "#f59e0b", fontWeight: 700 }}>{rows.reduce((s,r) => s+(parseFloat(r.recordedCoins)||0),0)}</td>
                      <td style={{ padding: "8px 10px", color: "#10b981", fontWeight: 800, fontSize: 14 }}>{totalCoins.toLocaleString()}</td>
                      <td style={{ padding: "8px 10px", color: "#ef4444", fontWeight: 700 }}>{rows.reduce((s,r) => s+(parseFloat(r.coinsLost)||0),0)}</td>
                      <td style={{ padding: "8px 10px", color: "#10b981", fontWeight: 700 }}>{rows.reduce((s,r) => s+(parseFloat(r.coinsOver)||0),0)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "top3" && (
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "#64748b", marginBottom: 24 }}>
              TOP 3 MACHINES BY COINS COLLECTED (REVENUE)
            </div>

            {ranked.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>
                No coin data entered yet. Fill in the Entry tab first.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 600 }}>
                {ranked.map((r, i) => {
                  const medals = ["🥇","🥈","🥉"];
                  const plays = Math.max(0, (parseFloat(r.playToday)||0) - (parseFloat(r.playYesterday)||0));
                  const maxCoins = parseFloat(ranked[0].actualCoins) || 1;
                  const pct = ((parseFloat(r.actualCoins) || 0) / maxCoins) * 100;
                  const rankColors = ["#f59e0b","#94a3b8","#b45309"];
                  return (
                    <div key={r.no} style={{
                      background: `linear-gradient(135deg, #131b2e, #0d1117)`,
                      border: `1px solid ${rankColors[i]}44`,
                      borderRadius: 16, padding: 24,
                      position: "relative", overflow: "hidden"
                    }}>
                      <div style={{
                        position: "absolute", top: -20, right: -10,
                        fontSize: 80, opacity: 0.05, userSelect: "none"
                      }}>{medals[i]}</div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{
                          fontSize: 40, width: 56, height: 56,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: `${rankColors[i]}18`, borderRadius: 12
                        }}>{medals[i]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, marginBottom: 2 }}>
                            RANK #{i+1} · MACHINE {r.no} · {r.code}
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                            {r.name}
                          </div>
                          <div style={{ display: "flex", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontSize: 28, fontWeight: 900, color: rankColors[i] }}>
                                {(parseFloat(r.actualCoins) || 0).toLocaleString()}
                              </div>
                              <div style={{ fontSize: 10, color: "#64748b" }}>COINS COLLECTED</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>{plays}</div>
                              <div style={{ fontSize: 10, color: "#64748b" }}>PLAYS TODAY</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>{r.catch || 0}</div>
                              <div style={{ fontSize: 10, color: "#64748b" }}>DOLLS CAUGHT</div>
                            </div>
                          </div>
                          <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", width: `${pct}%`,
                              background: `linear-gradient(90deg, ${rankColors[i]}, ${rankColors[i]}88)`,
                              borderRadius: 3, transition: "width 0.8s ease"
                            }} />
                          </div>
                          <div style={{ marginTop: 6, fontSize: 10, color: "#475569" }}>
                            {plays > 0 ? `Win rate: ${((parseFloat(r.catch)||0)/plays*100).toFixed(1)}%` : ""}
                            {r.coinsLost > 0 ? ` · Lost: ${r.coinsLost} coins` : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div style={{
                  background: "#0d1117", border: "1px solid #1e293b",
                  borderRadius: 12, padding: 20, marginTop: 8
                }}>
                  <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, marginBottom: 16 }}>ALL MACHINES REVENUE COMPARISON</div>
                  {rows
                    .filter(r => parseFloat(r.actualCoins) > 0)
                    .sort((a, b) => (parseFloat(b.actualCoins)||0) - (parseFloat(a.actualCoins)||0))
                    .map(r => {
                      const val = parseFloat(r.actualCoins) || 0;
                      const maxV = Math.max(...rows.map(x => parseFloat(x.actualCoins)||0));
                      const pct = (val / maxV) * 100;
                      return (
                        <div key={r.no} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 80, fontSize: 10, color: "#64748b", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {r.name.split(" ").slice(0, 2).join(" ")}
                          </div>
                          <div style={{ flex: 1, height: 14, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", width: `${pct}%`,
                              background: `linear-gradient(90deg, ${COLORS[r.size]}, ${COLORS[r.size]}88)`,
                              borderRadius: 3
                            }} />
                          </div>
                          <div style={{ width: 50, fontSize: 10, color: COLORS[r.size], textAlign: "right", fontWeight: 700 }}>
                            {val.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
