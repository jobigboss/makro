// api/admin/login
import { connectMongoDB } from '../../../../../lib/mongodb';
import MakroAdmin  from '../../../../../models/admin';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectMongoDB();

    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Body parse error:", err);
      return NextResponse.json({ error: "Body parse error", detail: err.message }, { status: 400 });
    }
    const { adminID, password } = body;
    console.log("Body:", body);

    let user;
    try {
      user = await MakroAdmin.findOne({ adminID, action: true });
    } catch (err) {
      console.error("Query error:", err);
      return NextResponse.json({ error: "DB error", detail: err.message }, { status: 500 });
    }
    console.log("User:", user);

    if (!user) {
      return NextResponse.json({ error: "not found" }, { status: 401 });
    }
    if (!user.adminPassword) {
      return NextResponse.json({ error: "Missing password" }, { status: 500 });
    }
    let match;
    try {
      match = await bcrypt.compare(password, user.adminPassword);
    } catch (err) {
      console.error("Bcrypt error:", err);
      return NextResponse.json({ error: "bcrypt error", detail: err.message }, { status: 500 });
    }
    console.log("Match:", match);

    if (!match) {
      return NextResponse.json({ error: "invalid password" }, { status: 401 });
    }

    try {
      const sessionId = crypto.randomUUID();
      user.sessionId = sessionId;
      await user.save();
      return NextResponse.json({
        name: user.adminName,
        role: user.adminRole,
        sessionId,
      });
    } catch (err) {
      console.error("User save error:", err);
      return NextResponse.json({ error: "Save error", detail: err.message }, { status: 500 });
    }
  } catch (err) {
    console.error("LOGIN ERROR:", err, err.stack);
    return NextResponse.json({ error: "Server Error", detail: err.message }, { status: 500 });
  }
}
