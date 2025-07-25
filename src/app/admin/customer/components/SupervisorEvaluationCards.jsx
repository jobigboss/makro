"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

function AvatarImage() {
  return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md ring-1 ring-[#ddd]">
      <img
        src="https://www.makro.pro/images/makro-pro-logo-new.svg"
        alt="Makro Logo"
        className="w-7 h-7 object-contain"
      />
    </div>
  );
}

function CardStat({ label, value, color, textColor }) {
  return (
    <div
      className="flex flex-col items-center border-2 rounded-md px-4 py-2 min-w-[62px] min-h-[52px] bg-white"
      style={{ borderColor: color }}
    >
      <div
        className="font-bold leading-none"
        style={{
          color: textColor || color,
          fontSize: "18px", // text-xl
        }}
      >
        {value}
      </div>
      <div className="text-xs text-gray-800 leading-none">{label}</div>
    </div>
  );
}


function getLevelColor(level) {
  if (level === "ดีเยี่ยม") return makroRed;
  if (level === "ดี") return makroBlue;
  if (level === "ปานกลาง") return "#FFC107";
  return "#444";
}

function SupervisorEvaluationCards({ adminID }) {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvaID, setExpandedEvaID] = useState(null);
  const [popupImage, setPopupImage] = useState(null);

  useEffect(() => {
    if (!adminID) return;
    setLoading(true);
    fetch(`/api/admin/customer/get/evaluation?adminID=${adminID}`)
      .then((res) => res.json())
      .then((res) => {
        setEvaluations(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [adminID]);

  if (loading)
    return (
      <div className="py-10 text-[#ED1B24] text-center">Loading...</div>
    );
  if (!evaluations.length)
    return (
      <div className="py-10 text-[#ED1B24] text-center">
        ไม่มีประเมินในระบบ
      </div>
    );

  return (
    <div className="w-full max-w-3xl mx-auto py-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
      {evaluations.map((eva) => (
        <div
          key={eva.evaID}
          className="rounded-2xl shadow border border-[#ED1B24]/20 bg-white p-4 flex flex-col gap-3"
          style={{ background: makroGray }}
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <AvatarImage />
            <div>
              <div className="text-sm font-bold text-[#ED1B24]">
                {eva.employeeName}
              </div>
              <div className="text-xs text-[#00205B]">{eva.branch}</div>
              <div className="text-xs text-gray-500">
                วันที่ {new Date(eva.createdAt).toLocaleDateString("th-TH")}
              </div>
            </div>
          </div>
          {/* Stat */}
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            <CardStat label="รวม" value={eva.total} color={makroRed} />
            <CardStat label="เฉลี่ย" value={eva.avg} color={makroBlue} />
            <CardStat label="ระดับ" value={eva.level} color={getLevelColor(eva.level)} />
          </div>

          {/* Expand btn */}
          <button
            onClick={() =>
              setExpandedEvaID(expandedEvaID === eva.evaID ? null : eva.evaID)
            }
            className="text-xs font-medium text-[#00205B] underline mt-2 text-left"
            aria-expanded={expandedEvaID === eva.evaID}
          >
            {expandedEvaID === eva.evaID
              ? "ซ่อนรายละเอียด"
              : "ดูรายละเอียดเพิ่มเติม"}
          </button>
          {/* คลี่รายละเอียดแต่ละหัวข้อ */}
          <AnimatePresence initial={false}>
            {expandedEvaID === eva.evaID && (
              <motion.div
                key="details"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="mt-2 border-t pt-3 space-y-5 overflow-hidden"
              >
                {HEADERS.map((header, i) => (
                  <div key={i} className="border-b last:border-b-0 pb-2 mb-1">
                    {/* หัวข้อ */}
                    <div className="font-bold text-xs text-[#ED1B24] mb-1 flex items-start">
                      <span className="mr-1 leading-tight pt-[2px]">{i + 1}.</span>
                      <span>{header}</span>
                    </div>
                    {/* คะแนน */}
                    <div className="flex gap-3 mb-1 items-center">
                      {[4, 3, 2, 1].map((scoreOption) => (
                        <label
                          key={scoreOption}
                          className={`flex items-center gap-1 text-xs
                            ${eva.scores?.[i] === scoreOption ? "font-bold text-[#ED1B24]" : "text-gray-600"}`}>
                          <input
                            type="radio"
                            disabled
                            checked={eva.scores?.[i] === scoreOption}
                            className="accent-[#ED1B24] cursor-default w-4 h-4"
                            readOnly
                          />
                          {scoreOption === 4 && "4 = ดีเยี่ยม"}
                          {scoreOption === 3 && "3 = ดี"}
                          {scoreOption === 2 && "2 = พอใช้ได้"}
                          {scoreOption === 1 && "1 = ไม่พอใจ"}
                        </label>
                      ))}
                    </div>
                    {/* หมายเหตุ */}
                    <div className="text-gray-700 text-xs mb-1">
                      หมายเหตุ: {eva.remarks?.[i] || "-"}
                    </div>
                    {/* รูป (เฉพาะข้อ 1) */}
                    {i === 0 && Array.isArray(eva.images) && eva.images.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {eva.images.map((img, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <img
                              src={img.url}
                              alt={img.label || ""}
                              className="w-12 h-12 rounded object-cover border border-[#ED1B24] cursor-pointer"
                              onClick={() => setPopupImage(img.url)}
                            />
                            <span className="text-[10px] text-gray-500 mt-1">{img.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {/* สรุป/ข้อเสนอแนะ */}
                <div className="text-xs text-[#00205B] mt-3">
                  <b>ข้อบกพร่อง/ปัญหา:</b> <span className="text-gray-700">{eva.summary || "-"}</span>
                </div>
                <div className="text-xs text-[#00205B]">
                  <b>ข้อเสนอแนะ:</b> <span className="text-gray-700">{eva.problem || "-"}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      {/* Popup รูป */}
      {popupImage && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          onClick={() => setPopupImage(null)}
        >
          <img
            src={popupImage}
            alt="popup"
            className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-xl border-4 border-white"
          />
        </div>
      )}
    </div>
  );
}

export default SupervisorEvaluationCards;
