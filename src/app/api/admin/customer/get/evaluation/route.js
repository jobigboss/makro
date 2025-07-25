// api/admin/customer/get/evaluation
import { connectMongoDB } from '../../../../../../../lib/mongodb';
import MakroAdmin   from '../../../../../../../models/evaluation';
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const adminID = searchParams.get("adminID");

    if (!adminID) {
      return NextResponse.json({ error: "Missing adminID" }, { status: 400 });
    }

    // ดึงเฉพาะของ admin นี้
    const evaluation = await MakroAdmin.find({ adminID }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ data: evaluation }, { status: 200 });
  } catch (error) {
    console.error("GET /evaluation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}