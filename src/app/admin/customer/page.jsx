"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart, ClipboardList, DollarSign, Users, Menu, LogOut, Sun, Moon, ChevronDown, ChevronUp
} from "lucide-react";
import SupervisorEvaluationCards from "./components/SupervisorEvaluationCards";

// ----------- MOCKUP PAGE COMPONENTS -----------

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-6 text-[#ee1c25] font-sans drop-shadow-sm">
        📊 Dashboard Overview
      </h2>
      <div className="bg-[#fffdfa] dark:bg-[#19171a] rounded-2xl p-6 shadow text-[#201a16] dark:text-[#ece5dd] text-center font-sans border border-[#ece5dd] dark:border-[#342626]">
        [ กราฟยอดขายรายเดือน/ข้อมูลสรุป ]
      </div>
    </div>
  );
}

function EvaluationDetail({ supervisor }) {
  // ดึง card ประเมินเฉพาะ supervisor คนนี้
  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-4 text-[#ee1c25] font-sans drop-shadow-sm">
        👩‍💼 {supervisor.adminName}
      </h2>
      {/* Card Evaluation */}
      <SupervisorEvaluationCards adminID={supervisor.adminID} />
    </div>
  );
}

// ------- Dummy Components -------
function Salary() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-6 text-[#ee1c25] font-sans drop-shadow-sm">
        💸 Salary
      </h2>
      <div className="bg-[#fffdfa] dark:bg-[#19171a] rounded-2xl p-6 shadow text-[#201a16] dark:text-[#ece5dd] text-center font-sans border border-[#ece5dd] dark:border-[#342626]">
        [ รายการเงินเดือนย้อนหลัง ]
      </div>
    </div>
  );
}
function Supervisor() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-6 text-[#ee1c25] font-sans drop-shadow-sm">
        👩‍💼 Supervisor
      </h2>
      <div className="bg-[#fffdfa] dark:bg-[#19171a] rounded-2xl p-6 shadow text-[#201a16] dark:text-[#ece5dd] text-center font-sans border border-[#ece5dd] dark:border-[#342626]">
        [ รายงานทีม/รายชื่อทีมงาน ]
      </div>
    </div>
  );
}

// ----------- MAIN PAGE -----------

export default function CustomarPage() {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(false);
  const [expandEval, setExpandEval] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [loadingSup, setLoadingSup] = useState(false);
  const [evalSupervisor, setEvalSupervisor] = useState(null);

  // โหลด supervisor list แค่ครั้งแรก (และ set คนแรกเป็น active)
  useEffect(() => {
    if (expandEval && supervisors.length === 0 && !loadingSup) {
      setLoadingSup(true);
      fetch("/api/admin/customer/get/supervisor")
        .then((res) => res.json())
        .then((res) => {
          setSupervisors(res.data || []);
          setLoadingSup(false);

          // ถ้ามีคนแรกและยังไม่ได้เลือก ให้ set เลย
          if ((res.data || []).length > 0 && !evalSupervisor) {
            setEvalSupervisor(res.data[0]);
            setPage("evaluation");
          }
        })
        .catch(() => setLoadingSup(false));
    }
    // eslint-disable-next-line
  }, [expandEval, loadingSup]);

  // เมนู sidebar
  const MENU = [
    { key: "dashboard", label: "Dashboard", icon: <BarChart size={20} /> },
    { key: "evaluation", label: "Evaluation", icon: <ClipboardList size={20} /> },
    { key: "salary", label: "Salary", icon: <DollarSign size={20} /> },
    { key: "supervisor", label: "Supervisor", icon: <Users size={20} /> },
  ];

  // render sidebar menu item
  const renderMenuButton = (item) => {
    if (item.key === "evaluation") {
      return (
        <div key={item.key}>
          <button
            onClick={() => {
              setPage("evaluation");
              setExpandEval((v) => !v);
              // กรณีปิด accordion จะไม่ reset evalSupervisor
            }}
            className={`
              flex items-center gap-3 py-2 px-3 rounded-lg transition-all font-sans w-full
              ${page === "evaluation" && expandEval
                ? (dark
                  ? "bg-[#ee1c25]/30 font-bold text-[#ee1c25] shadow-sm"
                  : "bg-[#ee1c25]/15 font-bold text-[#ee1c25] shadow-sm")
                : (dark
                  ? "hover:bg-[#312227] text-[#ece5dd]"
                  : "hover:bg-[#f7e3e3] text-[#201a16]")
              }
            `}
          >
            {item.icon}
            {open && <span>{item.label}</span>}
            {open && <span className="ml-auto">{expandEval ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}</span>}
          </button>
          {/* submenu */}
          {expandEval && open && (
            <div className="ml-8 mt-1 flex flex-col gap-1 animate-fade-in">
              {loadingSup ? (
                <div className="text-xs text-gray-400 py-1">Loading...</div>
              ) : (
                supervisors.map((s, idx) => (
                  <button
                    key={s._id}
                    onClick={() => {
                      setPage("evaluation");
                      setEvalSupervisor(s);
                    }}
                    className={`
                      text-left py-1.5 px-2 rounded-lg transition text-sm font-medium
                      ${evalSupervisor?._id === s._id
                        ? "bg-[#ee1c25] text-white shadow font-bold"
                        : dark
                          ? "hover:bg-[#312227] text-[#ece5dd]"
                          : "hover:bg-[#f7e3e3] text-[#201a16]"
                      }
                    `}
                  >
                    {s.adminName}
                  </button>
                ))
              )}
              {!loadingSup && supervisors.length === 0 && (
                <div className="text-xs text-[#ee1c25]">No supervisor found.</div>
              )}
            </div>
          )}
        </div>
      );
    }
    // Default
    return (
      <button
        key={item.key}
        onClick={() => { setPage(item.key); setEvalSupervisor(null); setExpandEval(false); }}
        className={`
          flex items-center gap-3 py-2 px-3 rounded-lg transition-all font-sans
          ${page === item.key
            ? (dark
                ? "bg-[#ee1c25]/30 font-bold text-[#ee1c25] shadow-sm"
                : "bg-[#ee1c25]/15 font-bold text-[#ee1c25] shadow-sm")
            : (dark
                ? "hover:bg-[#312227] text-[#ece5dd]"
                : "hover:bg-[#f7e3e3] text-[#201a16]")
          }
        `}
      >
        {item.icon}
        {open && <span>{item.label}</span>}
      </button>
    );
  };

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${dark ? "bg-[#19171a]" : "bg-[#f5f3f0]"}`}>
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300
        ${dark ? "bg-[#2c181b] border-[#342626]" : "bg-[#fffdfa] border-[#ece5dd]"}
        shadow-lg h-screen ${open ? "w-56" : "w-16"} flex flex-col border-r`}
      >
        <div className={`flex items-center h-16 px-4 border-b ${dark ? "border-[#342626]" : "border-[#ece5dd]"}`}>
          <span className="font-extrabold text-lg text-[#ee1c25] tracking-wider font-sans drop-shadow-sm">
            {open && "MAKRO DASHBOARD"}
          </span>
          <button className="ml-auto p-1" aria-label="Toggle Sidebar" onClick={() => setOpen(v => !v)}>
            <Menu />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-1 mt-4">
          {MENU.map(renderMenuButton)}
        </nav>
        {/* Theme Switcher */}
        <button
          className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
            dark
              ? "hover:bg-[#3c2230] text-yellow-200"
              : "hover:bg-[#fce2aa] text-yellow-500"
          } transition mb-2 font-sans`}
          aria-label="Toggle Theme"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
          {open && <span>{dark ? "กลางวัน" : "กลางคืน"}</span>}
        </button>
        {/* Logout */}
        <button
          className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#fde8e7] dark:hover:bg-[#872024]/20 text-[#ee1c25] transition mb-4 font-sans`}
          aria-label="Logout"
          onClick={() => window.location.href = "/admin"}
        >
          <LogOut size={20} />
          {open && <span>Logout</span>}
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {page === "dashboard" && <Dashboard />}
        {page === "salary" && <Salary />}
        {page === "supervisor" && <Supervisor />}
        {page === "evaluation" && !evalSupervisor && (
          <div className="text-center text-[#b2a69a] mt-12">กรุณาเลือก Supervisor ที่ต้องการ</div>
        )}
        {page === "evaluation" && evalSupervisor && (
          <EvaluationDetail supervisor={evalSupervisor} />
        )}
      </main>
    </div>
  );
}
