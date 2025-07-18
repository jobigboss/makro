// api/admin/login
import { connectMongoDB } from '../../../../../lib/mongosb';
import MakroAdmin  from '../../../../../models/admin';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
  await connectMongoDB();
  const { adminID, password } = await req.json();

  const user = await MakroAdmin.findOne({ adminID, action: true });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 401 });

  const match = await bcrypt.compare(password, user.adminPassword);
  if (!match) return NextResponse.json({ error: "invalid password" }, { status: 401 });

  const sessionId = crypto.randomUUID();
  user.sessionId = sessionId;
  await user.save();

  return NextResponse.json({
    name: user.adminName,
    role: user.adminRole,
    sessionId,
  });
}