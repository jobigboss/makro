import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ใช้ connection string ของคุณ (db ชื่อ makro)
mongoose.connect("mongodb+srv://rec:rec2025@recruitment.uyddnbs.mongodb.net/makro", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema ตามโครงสร้างล่าสุด
const AdminSchema = new mongoose.Schema({
  adminID: String,
  adminPassword: String,
  adminName: String,
  adminTel: String,
  adminSalary: { type: [Number], default: [] },  // Array (ประวัติเงินเดือน)
  adminRole: String,                             // **เปลี่ยนชื่อ field เป็น adminRole**
  action: Boolean,
  sessionId: String,
}, { collection: "MK_admin" });

const Admin = mongoose.model("Admin", AdminSchema);

async function updatePasswordToHash() {
  // hash password ทุกคนใน collection ที่ยังไม่ถูก hash
  const admins = await Admin.find({});
  for (const admin of admins) {
    // เงื่อนไข: ถ้าเป็น plain text (ความยาว < 30) จึง hash
    if (admin.adminPassword && admin.adminPassword.length < 30) {
      const hash = await bcrypt.hash(admin.adminPassword, 10);
      admin.adminPassword = hash;
      await admin.save();
      console.log(`Hashed: ${admin.adminID}`);
    }
  }
  mongoose.disconnect();
  console.log("All password hashed!");
}

updatePasswordToHash();
