// api/evaluation/submint
import { connectMongoDB } from "../../../../../lib/mongosb";
import Evaluation from "../../../../../models/evaluation";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectMongoDB();
  const data = await req.json();
  const doc = await Evaluation.create(data);
  return NextResponse.json({ success: true, data: doc });
}