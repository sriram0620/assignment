"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useMutation } from "@tanstack/react-query";
import { login, register } from "@/lib/api";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuth } = useAppStore();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regOrgName, setRegOrgName] = useState("");
  const [regIndustry, setRegIndustry] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const loginMutation = useMutation({
    mutationFn: login,
  });

  const registerMutation = useMutation({
    mutationFn: register,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { user, token } = await loginMutation.mutateAsync({ email: loginEmail, password: loginPassword });
      setAuth(user, token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("401") || msg.includes("Invalid")) {
        setError("Invalid email or password. Please check your credentials.");
      } else {
        setError("Unable to sign in right now. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (regPassword !== regConfirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const { user, token } = await registerMutation.mutateAsync({
        orgName: regOrgName,
        industry: regIndustry,
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
      });
      setAuth(user, token);
    } catch {
      setError("Unable to register right now. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#0d1120] to-[#080d1a] border-r border-[#1e2a45] relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-white text-lg">Mini AI-HRMS</div>
              <div className="text-xs text-gray-500">RizeOS Platform</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Workforce Intelligence<br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Powered by AI</span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              AI-driven productivity scoring, smart task assignment, and skill gap detection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: "⚡", title: "AI Workforce Intelligence", desc: "Gemini-powered productivity scoring & smart assignment" },
              { icon: "👥", title: "Full Employee Management", desc: "Profiles, skills, departments, and performance tracking" },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="text-xs text-gray-400">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-600">
          Built for the RizeOS Core Team Internship Assessment
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo on mobile */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="font-bold text-white">Mini AI-HRMS</div>
          </div>

          {/* Tab toggle */}
          <div className="flex rounded-xl bg-[#0d1120] border border-[#1e2a45] p-1 mb-8">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === "login" ? "bg-violet-600 text-white shadow" : "text-gray-400 hover:text-gray-200"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === "register" ? "bg-violet-600 text-white shadow" : "text-gray-400 hover:text-gray-200"}`}
            >
              Register Org
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
                <p className="text-sm text-gray-400">Sign in to your organization account</p>
              </div>

              {/* Info box */}
              <div className="bg-cyan-600/10 border border-cyan-500/30 rounded-xl p-4">
                <div className="text-xs font-semibold text-cyan-300 mb-1.5">New here?</div>
                <div className="text-xs text-gray-400 leading-relaxed">
                  Switch to <strong className="text-cyan-200">Register Org</strong> tab to create your organization workspace first. Employees receive their login credentials via email when added by an admin.
                </div>
              </div>

              {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-[#0d1120] border border-[#1e2a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-[#0d1120] border border-[#1e2a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : "Sign In to HRMS"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Register Your Organization</h2>
                <p className="text-sm text-gray-400">Set up your HRMS workspace in minutes</p>
              </div>

              {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Organization Name</label>
                  <input
                    value={regOrgName}
                    onChange={e => setRegOrgName(e.target.value)}
                    className="w-full bg-[#0d1120] border border-[#1e2a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition"
                    placeholder="Acme Technologies"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Industry</label>
                  <input
                    value={regIndustry}
                    onChange={e => setRegIndustry(e.target.value)}
                    className="w-full bg-[#0d1120] border border-[#1e2a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition"
                    placeholder="Software & Tech"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Your Full Name (Admin)</label>
                <input
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  className="w-full bg-[#0d1120] border border-[#1e2a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Work Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full bg-[#0d1120] border border-[#1e2a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition"
                  placeholder="jane@yourcompany.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full bg-[#0d1120] border border-[#1e2a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                    className="w-full bg-[#0d1120] border border-[#1e2a45] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating workspace...
                  </>
                ) : "Create Organization"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
