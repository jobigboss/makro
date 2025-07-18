"use client";
import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";

// ======= ฟังก์ชันอัปโหลดไฟล์ไป S3 Presigned URL =======
async function uploadToS3(file, evaID, label) {
  const ext = file.name.split('.').pop();
  const filename = `${evaID}-${label}.${ext}`;
  console.log("File to upload:", filename, file.type);

  const urlRes = await fetch(`/api/evaluation/upload-url-aws?filename=${filename}&contentType=${encodeURIComponent(file.type)}`);
  const { url, fileUrl } = await urlRes.json();

  console.log("S3 presigned url", url);

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  // log response status
  if (!res.ok) {
    const errText = await res.text();
    console.error("Upload error", res.status, errText);
    throw new Error(`Upload failed: ${res.status} - ${errText}`);
  }

  return fileUrl;
}

const makroRed = "#ED1B24";
const makroBlue = "#00205B";
const makroGray = "#F6F6F6";

const HEADERS = [
  "การแต่งกาย บุคลิกภาพ(ยูนิฟอร์มถูกต้อง,ใส่หมวก ,ผ้ากันเปื้อน ,ความสะอาด)",
  "ความกระตือรือร้น ยิ้มแย้มแจ่มใส ในการทำงาน เข้าหาลุกค้าตลอดเวลาที่มีลูกค้าและอยู่ที่บูทตลอด",
  "ความรู้ ความเข้าใจ เกี่ยวกับผลิตภัณฑ์ และวิธีการจัดชิม",
  "การเปิด-ปิดการขาย (การ present ลูกค้า) ต้นทุน กำไร  เมนูแนะนำ",
  "ความตรงต่อเวลา (การเข้า-ออก และ ระหว่างการทำงาน)มาทำงานตรงเวลา อย่างสม่ำเสมอ ไม่ลาบ่อย ไม่เข้างานสาย หรือ เลิกงานก่อนเวลา",
  "การแจ้ง และ ลาหยุด (กรณีลาป่วยแจ้งก่อน 8.30 น. ลากิจ ล่วงหน้า 3 วัน ลาฉุกเฉิน (ญาติเสีย)ทันที)",
  "ความพร้อมของพื้นที่ที่รับผิดชอบ (Shelf,POP,Booth ป้ายราคา stock )",
  "ความพร้อมของสินค้าในการจัดชิม เชค stock  ก่อนการจัดชิม และแจ้งสาขากรณีสินค้ามีไม่เพียงพอต่อ taget ",
  "target การขายในแต่ละวัน ทำได้ตามเป้าหรือไม่(>80% = 4 ,79% - 61% = 3 ,51% - 60% = 2 ,<60% = 1)",
  "การแจ้ง Report (Stock,ยอดขาย,) ตรงเวลา"
];

export default function MakroEvaluationForm() {
  const [employeeName, setEmployeeName] = useState("");
  const [branch, setBranch] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [scores, setScores] = useState(Array(10).fill(""));
  const [remarks, setRemarks] = useState(Array(10).fill(""));
  const [images, setImages] = useState([undefined, undefined]);
  const [summary, setSummary] = useState("");
  const [problem, setProblem] = useState("");
  const [storeComment, setStoreComment] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const summaryRef = useRef(null);
  const [employeeCode, setEmployeeCode] = useState("TEST1234");

  const total = scores.reduce((acc, cur) => acc + (parseInt(cur) || 0), 0);
  const avg = (total / HEADERS.length).toFixed(2);

  function getLevelAndColor(avg) {
    avg = parseFloat(avg);
    if (avg >= 3.5) return { text: "ดีเยี่ยม", color: makroRed };
    if (avg >= 2.5) return { text: "ดี", color: makroBlue };
    if (avg >= 1.5) return { text: "ปานกลาง", color: "#FFC107" };
    return { text: "ต้องปรับปรุง", color: "#444" };
  }
  const level = getLevelAndColor(avg);

  const handleScore = (idx, value) => {
    setScores(scores.map((v, i) => (i === idx ? value : v)));
  };
  const handleRemark = (idx, value) => {
    setRemarks(remarks.map((v, i) => (i === idx ? value : v)));
  };
  const handleImage = (imgIdx, file) => {
    setImages(prev =>
      prev.map((v, i) =>
        i === imgIdx && file
          ? { file, url: URL.createObjectURL(file), label: imgIdx === 0 ? "full" : "hand" }
          : i === imgIdx && !file
          ? undefined
          : v
      )
    );
  };

  const scoreOptions = [
    { value: "4", label: "4 = ดีเยี่ยม", color: "text-[#ED1B24]" },
    { value: "3", label: "3 = ดี", color: "text-[#00205B]" },
    { value: "2", label: "2 = พอใช้ได้", color: "text-[#00205B]" },
    { value: "1", label: "1 = ไม่พอใจ", color: "text-[#00205B]" }
  ];

  const handleDownload = async () => {
    if (!summaryRef.current) return;
    const canvas = await html2canvas(summaryRef.current, { backgroundColor: null });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "makro-evaluation-summary.png";
    a.click();
  };

  // ส่งข้อมูลไป API
const handleSave = async () => {
  setLoading(true);
  try {
    // 1. ขอ evaID ก่อน
    const resID = await fetch("/api/evaluation/gen-id");
    const { evaID } = await resID.json();

    // 2. อัปโหลดรูป ถ้ามี (วนแต่ละ label)
    let imageUrls = [undefined, undefined];
    for (let idx = 0; idx < images.length; idx++) {
      const img = images[idx];
      if (img?.file) {
        const label = idx === 0 ? "full" : "hand";
        const url = await uploadToS3(img.file, evaID, label);
        imageUrls[idx] = { url, label };
      }
    }
    const imagesPayload = imageUrls.filter(Boolean);

    // 3. payload ข้อมูลอื่นๆ
    const payload = {
      evaID,
      employeeName,
      employeeCode,
      branch,
      workTime,
      scores: scores.map((s) => Number(s) || 0),
      remarks,
      images: imagesPayload,
      summary,
      problem,
      storeComment,
      total,
      avg: Number(avg),
      level: level.text,
    };

    const res = await fetch("/api/evaluation/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("บันทึกผลเรียบร้อย!");
      setShowSummary(false);
      setEmployeeName(""); setBranch(""); setWorkTime("");
      setScores(Array(10).fill(""));
      setRemarks(Array(10).fill(""));
      setImages([undefined, undefined]);
      setSummary(""); setProblem(""); setStoreComment("");
      setEmployeeCode("TEST1234");
    } else {
      alert("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
  } catch (err) {
    alert("error: " + err.message);
  }
  setLoading(false);
};

  return (
    <>
      <div className="min-h-screen flex justify-center items-center px-2" style={{ background: makroGray }}>
        <div className="w-full max-w-2xl rounded-2xl shadow-2xl bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center gap-3 pt-8 pb-2">
            <img src="https://www.makro.pro/images/makro-pro-logo-new.svg" alt="makro" className="h-10" />
            <h2 className="text-2xl md:text-3xl font-extrabold" style={{ color: makroRed }}>
              ฟอร์มประเมินพนักงาน
            </h2>
          </div>
          {/* ส่วนหัว */}
          <div className="px-6 pt-2 pb-4 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="font-semibold text-[#00205B]">ชื่อพนักงาน</label>
                <input
                  type="text"
                  className="w-full mt-1 rounded-lg px-3 py-2 bg-[#F6F6F6] text-[#00205B] shadow focus:ring-2 focus:ring-[#ED1B24] border-none outline-none"
                  placeholder="กรอกชื่อพนักงาน"
                  value={employeeName}
                  onChange={e => setEmployeeName(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="font-semibold text-[#00205B]">สาขา</label>
                <input
                  type="text"
                  className="w-full mt-1 rounded-lg px-3 py-2 bg-[#F6F6F6] text-[#00205B] shadow focus:ring-2 focus:ring-[#ED1B24] border-none outline-none"
                  placeholder="กรอกชื่อสาขา"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="font-semibold text-[#00205B]">เวลา เข้า-ออก</label>
                <input
                  type="text"
                  className="w-full mt-1 rounded-lg px-3 py-2 bg-[#F6F6F6] text-[#00205B] shadow focus:ring-2 focus:ring-[#ED1B24] border-none outline-none"
                  placeholder="09:00 - 18:00"
                  value={workTime}
                  onChange={e => setWorkTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 px-4 pb-2">
            {HEADERS.map((header, idx) => (
              <div key={idx} className="rounded-xl bg-white px-4 py-3 shadow-md flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <div className="font-bold text-lg sm:text-xl mt-1" style={{ color: makroRed, minWidth: "2.3rem" }}>
                    {idx + 1}.
                  </div>
                  <div className="flex-1 font-semibold text-base xs:text-[1.03rem] sm:text-lg text-[#00205B] leading-relaxed break-words">
                    {header}
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full mt-1">
                  <div className="flex flex-row gap-2 flex-wrap">
                    {scoreOptions.map(opt => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-1 cursor-pointer px-1 ${scores[idx] === opt.value ? "font-bold" : "font-normal"}`}
                      >
                        <input
                          type="radio"
                          name={`score-${idx}`}
                          value={opt.value}
                          checked={scores[idx] === opt.value}
                          onChange={() => handleScore(idx, opt.value)}
                          className="accent-[#ED1B24] w-5 h-5"
                        />
                        <span className={`text-base ${opt.color}`}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {/* หมายเหตุ */}
                  <input
                    type="text"
                    className="rounded-lg px-2 py-2 bg-[#F6F6F6] w-full text-[#00205B] placeholder:text-gray-400 text-base shadow focus:ring-2 focus:ring-[#ED1B24] border-none outline-none"
                    style={{
                      border: "none",
                      outline: "none",
                      boxShadow: "0 2px 10px 0 rgba(30, 42, 67, 0.08)"
                    }}
                    placeholder="หมายเหตุ"
                    value={remarks[idx]}
                    onChange={e => handleRemark(idx, e.target.value)}
                  />
                  {/* ช่องรูป (เฉพาะข้อ 1) */}
                  {idx === 0 && (
                    <div className="flex gap-4 mt-2 flex-wrap">
                      {["รูปเต็ม", "รูปเล็บมือ"].map((label, j) => (
                        <div key={j} className="flex flex-col items-center">
                          <div className="text-xs font-semibold text-[#00205B] mb-1">{label}</div>
                          <label
                            className="w-[110px] h-[110px] bg-[#F6F6F6] rounded-lg shadow flex items-center justify-center cursor-pointer border-2 border-dashed border-[#CED4DA] hover:border-[#ED1B24] transition"
                            style={{ position: "relative", overflow: "hidden" }}
                          >
                            {images[j]?.url ? (
                              <img
                                src={images[j].url}
                                alt={`img-${j}`}
                                className="object-cover w-full h-full rounded-lg"
                              />
                            ) : (
                              <span className="text-gray-400 text-3xl">+</span>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={e => {
                                if (e.target.files?.[0]) handleImage(j, e.target.files[0]);
                              }}
                            />
                            {images[j]?.url && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.preventDefault();
                                  handleImage(j, null);
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-red-500 text-sm font-bold shadow"
                                title="ลบรูป"
                              >×</button>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Total */}
          <div className="flex justify-end text-lg font-bold px-6 py-2 select-none">
            <span className="mr-2 text-[#00205B]">Total:</span>
            <span style={{ color: makroRed }}>{total}</span>
            <span className="ml-1 text-[#00205B]">/ 40</span>
          </div>
          {/* ข้อบกพร่อง/ปัญหา */}
          <div className="px-6 pb-3">
            <div className="font-semibold text-[#00205B]">ข้อบกพร่อง/ปัญหาที่เกิด</div>
            <textarea
              className="w-full rounded-xl mt-1 px-3 py-2 bg-[#F6F6F6] text-[#00205B] placeholder-gray-400 text-base shadow focus:ring-2 focus:ring-[#ED1B24] border-none outline-none"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "0 2px 10px 0 rgba(30, 42, 67, 0.08)",
                resize: "vertical"
              }}
              rows={2}
              placeholder="ระบุข้อบกพร่อง/ปัญหาที่เกิด"
              value={summary}
              onChange={e => setSummary(e.target.value)}
            />
          </div>
          {/* วิธีแก้ไข */}
          <div className="px-6 pb-3">
            <div className="font-semibold text-[#00205B]">วิธีแก้ไขปัญหา</div>
            <textarea
              className="w-full rounded-xl mt-1 px-3 py-2 bg-[#F6F6F6] text-[#00205B] placeholder-gray-400 text-base shadow focus:ring-2 focus:ring-[#ED1B24] border-none outline-none"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "0 2px 10px 0 rgba(30, 42, 67, 0.08)",
                resize: "vertical"
              }}
              rows={2}
              placeholder="ใส่ความคิดเห็น..."
              value={problem}
              onChange={e => setProblem(e.target.value)}
            />
          </div>
          {/* ความคิดเห็นจากสโตร์ */}
          <div className="px-6 pb-5">
            <div className="font-semibold text-[#00205B]">ความคิดเห็นจากสโตร์</div>
            <textarea
              className="w-full rounded-xl mt-1 px-3 py-2 bg-[#F6F6F6] text-[#00205B] placeholder-gray-400 text-base shadow focus:ring-2 focus:ring-[#ED1B24] border-none outline-none"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "0 2px 10px 0 rgba(30, 42, 67, 0.08)",
                resize: "vertical"
              }}
              rows={2}
              placeholder="ระบุความคิดเห็นจากสโตร์.."
              value={storeComment}
              onChange={e => setStoreComment(e.target.value)}
            />
          </div>
          <div className="flex justify-center py-4">
            <button
              className="px-10 py-2 rounded-xl shadow-xl font-bold text-white text-lg hover:scale-105 transition"
              style={{
                background: makroRed,
                boxShadow: "0 4px 24px 0 rgba(237, 27, 36, 0.10)"
              }}
              onClick={() => setShowSummary(true)}
            >
              สรุปผลการประเมิน
            </button>
          </div>
        </div>
      </div>

      {/* Modal Summary */}
      {showSummary && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-xl w-[99vw] overflow-hidden border border-[#ED1B24]/40">
            <div
              ref={summaryRef}
              className="p-6 rounded-t-2xl"
              style={{
                background: makroGray,
                borderBottom: "1.5px solid #ED1B24"
              }}
            >
              {/* แสดงส่วนหัว */}
              <div className="mb-4 flex flex-col gap-1 text-base text-[#00205B] font-medium">
                <div>ชื่อพนักงาน: <span className="font-bold">{employeeName || "-"}</span></div>
                <div>สาขา: <span className="font-bold">{branch || "-"}</span></div>
                <div>เวลาเข้า-ออก: <span className="font-bold">{workTime || "-"}</span></div>
              </div>
              <div className="font-extrabold text-xl mb-4 flex gap-2 items-center" style={{ color: makroRed }}>
                <span>📊 ผลรวมคะแนน + สรุปผล</span>
              </div>
              {/* คะแนน */}
              <div className="flex gap-4 flex-wrap justify-center mb-4 mt-2">
                {/* คะแนนรวม */}
                <div className="bg-white rounded-xl shadow-md w-40 py-5 flex flex-col items-center gap-1 border-2 border-[#ED1B24]">
                  <div className="text-3xl font-bold text-[#ED1B24] flex items-center gap-2">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#ED1B24" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#ED1B24" strokeWidth="2" strokeLinecap="round"/></svg>
                    {total}
                  </div>
                  <div className="text-xs text-[#00205B] font-semibold tracking-tight">คะแนนรวม</div>
                </div>
                {/* คะแนนเฉลี่ย */}
                <div className="bg-white rounded-xl shadow-md w-40 py-5 flex flex-col items-center gap-1 border-2 border-[#00205B]">
                  <div className="text-3xl font-bold text-[#00205B] flex items-center gap-2">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#00205B" strokeWidth="2"/><path d="M12 7v5l3 2" stroke="#00205B" strokeWidth="2" strokeLinecap="round"/></svg>
                    {avg}
                  </div>
                  <div className="text-xs text-[#00205B] font-semibold tracking-tight">คะแนนเฉลี่ย</div>
                </div>
                {/* ระดับ */}
                <div className="rounded-xl w-40 py-5 flex flex-col items-center gap-1 border-2" style={{ borderColor: level.color }}>
                  <div className="text-xl font-bold" style={{ color: level.color }}>{level.text}</div>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 rounded bg-[#fff] border border-[#eee] text-xs text-gray-500">
                      ระดับประเมิน
                    </span>
                  </div>
                </div>
              </div>
              {/* เกณฑ์สี */}
              <div className="mt-2 rounded-xl bg-white p-3 text-xs font-bold flex gap-4 items-center flex-wrap border border-[#CED4DA] text-[#00205B]">
                <div>เกณฑ์การประเมิน:</div>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#ED1B24] inline-block" /> 3.5-4.0 ดีเยี่ยม
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#00205B] inline-block" /> 2.5-3.4 ดี
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#FFC107] inline-block" /> 1.5-2.4 ปานกลาง
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#444] inline-block" /> 1.0-1.4 ต้องปรับปรุง
                </span>
              </div>
            </div>
            {/* ปุ่ม */}
            <div className="flex justify-between items-center p-4 gap-3 bg-[#F6F6F6]">
              <button
                onClick={() => setShowSummary(false)}
                className="px-6 py-2 rounded-xl font-bold bg-white border border-[#CED4DA] hover:bg-[#eee] text-[#00205B]"
                disabled={loading}
              >ปิด</button>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 rounded-xl font-bold bg-[#00205B] hover:bg-[#12316c] text-white shadow"
                  disabled={loading}
                >
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 rounded-xl font-bold bg-[#ED1B24] hover:bg-[#b9000b] text-white shadow"
                >
                  ดาวน์โหลด PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
