"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [addError, setAddError] = useState("");
  const [form, setForm] = useState({
    email: "",
    name: "",
    invoice_number: "26000-01",
    due_date: "",
  });

  async function loadClients() {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/clients");
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Serveris grąžino netikėtą atsakymą (${res.status}). Tikriausiai neteisingai sukonfigūruoti SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY aplinkos kintamieji Vercel projekte.`
        );
      }
      if (!res.ok) {
        throw new Error(data.error || `Klaida (${res.status})`);
      }
      setClients(data.clients || []);
    } catch (err) {
      setLoadError(err.message || "Nepavyko įkelti klientų sąrašo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function updateClient(id, updates) {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  }

  async function deleteClient(id) {
    if (!confirm("Ištrinti šį klientą iš sąrašo?")) return;
    setClients((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
  }

  async function handleAddClient(e) {
    e.preventDefault();
    setAddError("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Serveris grąžino netikėtą atsakymą (${res.status}).`);
      }
      if (!res.ok) {
        throw new Error(data.error || `Klaida (${res.status})`);
      }
      setClients((prev) => [data.client, ...prev]);
      setForm({ email: "", name: "", invoice_number: "26000-01", due_date: "" });
      setShowForm(false);
    } catch (err) {
      setAddError(err.message || "Nepavyko pridėti kliento.");
    }
  }

  async function handleSend() {
    const selected = clients.filter((c) => c.needs_reminder && !c.paid);
    if (selected.length === 0) {
      alert("Nepažymėtas joks klientas siuntimui.");
      return;
    }
    if (
      !confirm(
        `Siųsti priminimą ${selected.length} klientui/-ams? Šio veiksmo atšaukti negalima.`
      )
    ) {
      return;
    }

    setSending(true);
    setSendResult(null);
    const res = await fetch("/api/send-reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected.map((c) => c.id) }),
    });
    const data = await res.json();
    setSending(false);
    setSendResult(data.results || data.error);
    loadClients();
  }

  const selectedCount = clients.filter((c) => c.needs_reminder && !c.paid).length;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Lumera — sąskaitų priminimai</h1>
          <p style={styles.subtitle}>
            Pažymėkite klientus, kuriems reikia priminimo, ir spauskite „Siųsti dabar“.
          </p>
        </div>
        <button style={styles.addButton} onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Atšaukti" : "+ Pridėti klientą"}
        </button>
      </header>

      {showForm && (
        <>
        <p style={{ color: "#666", fontSize: "13px", margin: "0 0 8px" }}>
          „Vardas / įmonė“ — tik jūsų pačių atpažinimui sąraše (pvz. „Neringa,
          UAB Anratas“), laiške šis laukas niekur nerodomas. Sąskaitos Nr. ir
          terminas įrašomi automatiškai į siunčiamą laišką.
        </p>
        <form onSubmit={handleAddClient} style={styles.form}>
          <input
            style={styles.input}
            placeholder="El. paštas *"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Vardas / įmonė"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Sąskaitos Nr."
            value={form.invoice_number}
            onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
          />
          <input
            style={styles.input}
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
          <button type="submit" style={styles.saveButton}>
            Išsaugoti
          </button>
          {addError && <p style={{ color: "#c0392b", width: "100%", margin: "4px 0 0" }}>{addError}</p>}
        </form>
        </>
      )}

      {loadError && (
        <div style={{ ...styles.resultBox, marginBottom: "16px" }}>
          <p style={{ color: "#c0392b", margin: 0 }}>{loadError}</p>
        </div>
      )}

      {loading ? (
        <p>Kraunama...</p>
      ) : clients.length === 0 ? (
        <p style={styles.empty}>Klientų sąrašas tuščias. Pridėkite pirmą klientą.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Reikia priminimo</th>
              <th style={styles.th}>El. paštas</th>
              <th style={styles.th}>Vardas</th>
              <th style={styles.th}>Sąsk. Nr.</th>
              <th style={styles.th}>Terminas</th>
              <th style={styles.th}>Apmokėta</th>
              <th style={styles.th}>Paskutinis priminimas</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} style={c.paid ? styles.rowPaid : undefined}>
                <td style={styles.tdCenter}>
                  <input
                    type="checkbox"
                    checked={!!c.needs_reminder}
                    disabled={c.paid}
                    onChange={(e) =>
                      updateClient(c.id, { needs_reminder: e.target.checked })
                    }
                  />
                </td>
                <td style={styles.td}>{c.email}</td>
                <td style={styles.td}>{c.name || "—"}</td>
                <td style={styles.td}>
                  <input
                    style={styles.inlineInput}
                    defaultValue={c.invoice_number}
                    onBlur={(e) =>
                      e.target.value !== c.invoice_number &&
                      updateClient(c.id, { invoice_number: e.target.value })
                    }
                  />
                </td>
                <td style={styles.td}>
                  <input
                    style={styles.inlineInput}
                    type="date"
                    defaultValue={c.due_date || ""}
                    onBlur={(e) =>
                      e.target.value !== c.due_date &&
                      updateClient(c.id, { due_date: e.target.value })
                    }
                  />
                </td>
                <td style={styles.tdCenter}>
                  <input
                    type="checkbox"
                    checked={!!c.paid}
                    onChange={(e) => updateClient(c.id, { paid: e.target.checked })}
                  />
                </td>
                <td style={styles.td}>
                  {c.last_reminder_sent_at
                    ? new Date(c.last_reminder_sent_at).toLocaleString("lt-LT")
                    : "—"}
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.deleteButton}
                    onClick={() => deleteClient(c.id)}
                  >
                    Ištrinti
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={styles.footer}>
        <button
          style={styles.sendButton}
          onClick={handleSend}
          disabled={sending || selectedCount === 0}
        >
          {sending
            ? "Siunčiama..."
            : `Siųsti dabar (${selectedCount})`}
        </button>
      </div>

      {sendResult && (
        <div style={styles.resultBox}>
          {typeof sendResult === "string" ? (
            <p style={{ color: "#c0392b" }}>{sendResult}</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: "18px" }}>
              {sendResult.map((r, i) => (
                <li key={i} style={{ color: r.ok ? "#2d6a4f" : "#c0392b" }}>
                  {r.email} — {r.ok ? "išsiųsta" : `klaida: ${r.error}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "32px 20px 80px",
    fontFamily: "system-ui, sans-serif",
    color: "#1a1a1a",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: "24px" },
  subtitle: { margin: "6px 0 0", color: "#666", fontSize: "14px" },
  addButton: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#1a1a1a",
    color: "#fff",
    cursor: "pointer",
    height: "fit-content",
  },
  form: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "24px",
    background: "#f4f5f7",
    padding: "16px",
    borderRadius: "10px",
  },
  input: {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  inlineInput: {
    padding: "4px 6px",
    borderRadius: "4px",
    border: "1px solid transparent",
    fontSize: "13px",
    width: "100px",
    background: "transparent",
  },
  saveButton: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    background: "#2d6a4f",
    color: "#fff",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    textAlign: "left",
    borderBottom: "2px solid #eee",
    padding: "10px 8px",
    color: "#666",
    fontWeight: 600,
    fontSize: "13px",
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #f0f0f0",
  },
  tdCenter: {
    padding: "10px 8px",
    borderBottom: "1px solid #f0f0f0",
    textAlign: "center",
  },
  rowPaid: { opacity: 0.45 },
  deleteButton: {
    padding: "5px 10px",
    borderRadius: "6px",
    border: "1px solid #eee",
    background: "#fff",
    color: "#c0392b",
    cursor: "pointer",
    fontSize: "12px",
  },
  empty: { color: "#666" },
  footer: {
    position: "sticky",
    bottom: "0",
    marginTop: "24px",
    padding: "16px 0",
    background: "linear-gradient(transparent, #fff 30%)",
  },
  sendButton: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    background: "#2d6a4f",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
  },
  resultBox: {
    marginTop: "16px",
    padding: "14px",
    background: "#f4f5f7",
    borderRadius: "8px",
  },
};
