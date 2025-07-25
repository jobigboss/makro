import mongoose from "mongoose";

// ImageSchema เหมือนเดิม
const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  label: { type: String, enum: ["full", "hand"], required: true }
}, { _id: false });

const MakroEvaluationSchema = new mongoose.Schema({
  evaID: { type: String, required: true, unique: true }, // เพิ่ม unique
  employeeCode: { type: String},
  branch: { type: String, required: true },
  workTime: { type: String, required: true },
  scores: { type: [Number], required: true },
  remarks: { type: [String], required: true },
  images: { type: [ImageSchema], default: [] },
  summary: { type: String, default: "" },
  problem: { type: String, default: "" },
  storeComment: { type: String, default: "" },
  total: { type: Number, required: true },
  avg: { type: Number, required: true },
  level: { type: String, enum: ["ดีเยี่ยม", "ดี", "ปานกลาง", "ต้องปรับปรุง"], required: true },
  adminID:{type: String}
}, { timestamps: true });

const Evaluation = mongoose.models.Evaluation || mongoose.model("Evaluation", MakroEvaluationSchema, "MK_evaluation");

export default Evaluation;
