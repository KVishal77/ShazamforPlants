import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
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
        <h1 className="text-2xl font-bold text-green-700 mb-4">Sign up</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border px-3 py-2 rounded" placeholder="Email"
                 value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border px-3 py-2 rounded" placeholder="Password" type="password"
                 value={pass} onChange={e=>setPass(e.target.value)} />
          <button disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="text-sm text-center mt-3">
          Have an account? <Link to="/login" className="text-blue-600">Log in</Link>
        </p>
      </div>
    </div>
  );
}