"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoutReason, setLogoutReason] = useState("");
  const router = useRouter();

  useEffect(() => {
    const msg = localStorage.getItem("logout_reason");
    if (msg) {
      setLogoutReason(msg);
      localStorage.removeItem("logout_reason");
    }
  }, []);

  const doLogin = async ({ adminID, password }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminID, password }),
      });
      let data = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = { error: await res.text() };
      }
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("adminID", adminID);
      localStorage.setItem("sessionId", data.sessionId);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);

      if (data.role === "sup") {
        router.replace("/admin/supervisor");
      } else if (data.role === "admin") {
        router.replace("/admin/sf");
      } else if (data.role === "cus") {
        router.replace("/admin/customer");
      } else {
        setError("Role ไม่ถูกต้อง หรือยังไม่รองรับ");
      }
    } catch (err) {
      setLoading(false);
      setError("Network Error หรือ Server ไม่ตอบสนอง");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const adminID = e.target.adminID.value;
    const password = e.target.password.value;
    doLogin({ adminID, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3f0]">
      <form
        className="w-full max-w-sm bg-[#fffdfa] rounded-2xl shadow-xl p-8 space-y-7 flex flex-col items-center border border-[#ece5dd] transition-all"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div className="flex flex-col items-center mb-1">
          <div className="h-20 w-20 rounded-full bg-[#f1ede7] flex items-center justify-center shadow-inner border border-[#dfd1bd]">
            <img
              src="https://www.makro.pro/images/makro-pro-logo-new.svg"
              alt="Makro Logo"
              className="h-14 w-14 object-contain"
              draggable={false}
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 text-[#3a3025] tracking-tight">
          Welcome
        </h2>
        <div className="w-full">
          <label className="block mb-1 text-[#473726] font-medium">Admin ID</label>
          <input
            name="adminID"
            type="text"
            className="w-full px-4 py-2 border border-[#e2d8c4] rounded-lg bg-[#f8f6f3] text-[#3a3025] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#ee1c25] focus:border-[#ee1c25] transition"
            required
            autoFocus
            autoComplete="username"
          />
        </div>
        <div className="w-full">
          <label className="block mb-1 text-[#473726] font-medium">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2 border border-[#e2d8c4] rounded-lg bg-[#f8f6f3] text-[#3a3025] placeholder:text-[#bbb] focus:outline-none pr-16 focus:ring-2 focus:ring-[#ee1c25] focus:border-[#ee1c25] transition"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-[#a3957e] text-xs font-medium hover:underline focus:outline-none"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label="Show/Hide password"
            >
              {showPassword ? "ซ่อน" : "แสดง"}
            </button>
          </div>
        </div>
        {error && (
          <div className="text-[#ee1c25] text-center font-semibold animate-pulse">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-[#ee1c25] text-white font-bold mt-2 hover:bg-[#ba161b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ee1c25] shadow transition"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
        </button>
        {logoutReason && (
          <div className="mb-2 text-[#ee1c25] text-center font-bold">{logoutReason}</div>
        )}
        <div className="text-xs text-[#b2a69a] pt-2">
          © Makro Pro | For STRIKE FORCE COMPANY LIMITED
        </div>
      </form>
    </div>
  );
}
