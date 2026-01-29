import { useState } from "react";
import API from "./api";
import "./App.css";


export default function App() {
  // Token generation form
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    count: ""
  });

  // Token data from backend
  const [token, setToken] = useState(null);

  // Scan related states
  const [scanCount] = useState(1); // usually 1
  const [userScans, setUserScans] = useState(0); // USER scan limit
  const MAX_USER_SCANS = 3;

  const [message, setMessage] = useState("");

  /* =========================
     GENERATE TOKEN
  ========================== */
  const generateToken = async () => {
    try {
      const res = await API.post("/generate", {
        name: form.name,
        mobile: form.mobile,
        count: Number(form.count)
      });

      setToken(res.data);
      setUserScans(0); // reset user scans
      setMessage("✅ Token generated successfully");
    } catch (err) {
      setMessage("❌ Token generation failed");
    }
  };

  /* =========================
     SCAN TOKEN LOGIC
  ========================== */
  const scanToken = async () => {
    // USER scan limit check
    if (userScans >= MAX_USER_SCANS) {
      setMessage("❌ User scan limit reached (3 scans only)");
      return;
    }

    // TOKEN scan limit check
    if (token.remainingCount <= 0) {
      setMessage("❌ Token expired. No scans left");
      return;
    }

    try {
      const res = await API.post("/scan", {
        tokenId: token.tokenId,
        scanCount
      });

      setToken(res.data.token);
      setUserScans(prev => prev + 1);

      if (res.data.token.remainingCount === 0) {
        setMessage("⚠️ Token expired after this scan");
      } else {
        setMessage("✅ Scan successful");
      }
    } catch (err) {
      setMessage("❌ Scan failed");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "auto" }}>
      <h2>QR Token Management App</h2>

      {/* Generate Token */}
      <div>
        <h3>Generate Token</h3>
        <input
          placeholder="Name"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Mobile"
          onChange={e => setForm({ ...form, mobile: e.target.value })}
        />
        <input
          type="number"
          placeholder="Allowed Scans"
          onChange={e => setForm({ ...form, count: e.target.value })}
        />
        <button onClick={generateToken}>Generate Token</button>
      </div>

      {/* Token Details */}
      {token && (
        <>
          <hr />
          <h3>Token Details</h3>
          <p><b>Token ID:</b> {token.tokenId}</p>
          <p><b>Token Remaining Scans:</b> {token.remainingCount}</p>
          <p><b>User Scans Used:</b> {userScans} / 3</p>
          <img src={token.qrCode} width="150" />

          <br /><br />
          <button onClick={scanToken}>Scan Token</button>
        </>
      )}

      {message && <p><b>{message}</b></p>}
    </div>
  );
}
