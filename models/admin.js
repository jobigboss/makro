import mongoose from "mongoose";

const MakroAdminSchema = new mongoose.Schema({
  adminID: { type: String, required: true, unique: true },  // ใช้แทน username/email
  adminPassword: { type: String, required: true },           // เก็บ bcrypt hash
  adminName: { type: String, required: true },
  adminTel: { type: String, required: true },
  adminSalary: { type: [Number], default: [] },              // ประวัติเงินเดือน
  adminRole: { type: String, enum: ['sup', 'admin', 'cus'], required: true },
  action: { type: Boolean, default: true },                  // Active/Inactive
  sessionId: { type: String, default: null },                // ล่าสุด
}, { timestamps: true });

const MakroAdmin = mongoose.models.MakroAdmin || mongoose.model("MakroAdmin", MakroAdminSchema, "MK_admin");
export default MakroAdmin;
