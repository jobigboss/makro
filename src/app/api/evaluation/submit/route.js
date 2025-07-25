// api/evaluation/submint
import { connectMongoDB } from "../../../../../lib/mongodb";
import Evaluation from "../../../../../models/evaluation";
import { NextResponse } from "next/server";

// แก้ POST /api/servey/submit/survey ให้ update document เดิม
export async function POST(req) {
  await connectMongoDB();
  const { user_id, market_info } = await req.json();

  // update survey ที่ user_id ตรง
  const survey = await Survey.findOneAndUpdate(
    { user_id },
    { $set: { market_info, status: "completed" } },
    { new: true }
  );

  if (!survey) {
    return NextResponse.json({ ok: false, error: "ไม่พบ survey" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: survey });
}
