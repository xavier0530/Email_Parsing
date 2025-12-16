import React, { useEffect, useState } from "react";

export default function App() {
  const [health, setHealth] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [parsed, setParsed] = useState(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: "unreachable" }));
  }, []);

  async function handleParse(e) {
    e.preventDefault();
    const res = await fetch("/api/parse-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const json = await res.json();
    setParsed(json.parsed || json);
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 20 }}>
      <h1>Deployment Intelligence — Local Demo</h1>
      <p>Backend status: {health ? health.status : "loading..."}</p>

      <form onSubmit={handleParse} style={{ marginTop: 20 }}>
        <div>
          <label>Subject</label>
          <br />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: 600 }} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Body</label>
          <br />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} cols={80} />
        </div>
        <button style={{ marginTop: 8 }} type="submit">Parse Email</button>
      </form>

      <div style={{ marginTop: 24 }}>
        <h3>Parsed output</h3>
        <pre style={{ background: "#f6f8fa", padding: 12 }}>{JSON.stringify(parsed, null, 2)}</pre>
      </div>
    </div>
  );
}