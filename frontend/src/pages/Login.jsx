import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("demo_user", email || "guest@example.com");
      navigate("/dashboard");
    }, 200);
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-green-700 mb-4">Log in</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border px-3 py-2 rounded" placeholder="Email"
                 value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border px-3 py-2 rounded" placeholder="Password" type="password"
                 value={pass} onChange={e=>setPass(e.target.value)} />
          <button disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="text-sm text-center mt-3">
          No account? <Link to="/signup" className="text-blue-600">Sign up</Link>
        </p>
      </div>
    </div>
  );
}