// api/admin/customer/get/supervisor
import { connectMongoDB } from '../../../../../../../lib/mongodb';
import MakroAdmin   from '../../../../../../../models/admin';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    const supervisors = await MakroAdmin.find({ adminRole: "sup" }).select("adminID adminName adminRole");

    return NextResponse.json({
      ok: true,
      data: supervisors,
    });
  } catch (err) {
    // ดู error message ที่นี่
    return NextResponse.json({
      ok: false,
      error: err.message,
    }, { status: 500 });
  }
}