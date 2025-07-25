// api/evaluation/gen-id
import { connectMongoDB } from "../../../../../lib/mongodb";
import Evaluation from "../../../../../models/evaluation";
import { NextResponse } from "next/server";

function pad(num, size) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

export async function GET() {
  try {
    await connectMongoDB();

    const now = new Date(Date.now() + 7 * 60 * 60 * 1000); // Thailand Time
    const year = now.getFullYear().toString().slice(-2);
    const month = pad(now.getMonth() + 1, 2);
    const day = pad(now.getDate(), 2);
    const prefix = `EVA-${year}${month}${day}`;

    const regex = new RegExp(`^${prefix}(\\d{3})$`);
    const last = await Evaluation.findOne({ evaID: { $regex: regex } }).sort({ evaID: -1 });

    let nextNumber = 1;
    if (last && last.evaID) {
      const match = last.evaID.match(/(\d{3})$/);
      if (match) nextNumber = parseInt(match[1]) + 1;
    }

    const evaID = `${prefix}${pad(nextNumber, 3)}`;

    return NextResponse.json({ evaID });
  } catch (err) {
    console.error("GEN-ID ERROR:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}