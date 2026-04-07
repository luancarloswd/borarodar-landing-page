import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/db";
import { WaitlistEntry } from "@/models/WaitlistEntry";
import { sendWaitlistConfirmation } from "@/lib/email";

const waitlistSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  city: z.string().max(100).optional(),
  locale: z.string().default("pt-BR"),
  ref: z.string().optional(),
});

// In-memory fallback when MongoDB is not available
let inMemoryCount = 1247;
const inMemoryEntries: Array<{
  name: string;
  email: string;
  position: number;
  referralCode: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = waitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, city, locale, ref } = parsed.data;

    const db = await connectDB();

    if (db) {
      // Check for duplicate
      const existing = await WaitlistEntry.findOne({
        email: email.toLowerCase(),
      });
      if (existing) {
        return NextResponse.json(
          {
            position: existing.position,
            referralCode: existing.referralCode,
            referralCount: existing.referralCount,
            duplicate: true,
          },
          { status: 200 }
        );
      }

      // Get next position
      const lastEntry = await WaitlistEntry.findOne()
        .sort({ position: -1 })
        .select("position");
      const position = (lastEntry?.position || 0) + 1;

      // Generate referral code
      const referralCode = nanoid(10);

      // Create entry
      const entry = await WaitlistEntry.create({
        name,
        email: email.toLowerCase(),
        city,
        locale,
        position,
        referralCode,
        referredBy: ref,
        status: "pending",
      });

      // Increment referrer's count
      if (ref) {
        await WaitlistEntry.findOneAndUpdate(
          { referralCode: ref },
          { $inc: { referralCount: 1 } }
        );
      }

      // Send confirmation email (non-blocking)
      sendWaitlistConfirmation({
        to: email,
        name,
        position,
        referralCode,
        locale,
      }).catch(console.error);

      return NextResponse.json({
        position: entry.position,
        referralCode: entry.referralCode,
        referralCount: 0,
      });
    }

    // Fallback: in-memory
    const existingInMem = inMemoryEntries.find(
      (e) => e.email === email.toLowerCase()
    );
    if (existingInMem) {
      return NextResponse.json({
        position: existingInMem.position,
        referralCode: existingInMem.referralCode,
        referralCount: 0,
        duplicate: true,
      });
    }

    inMemoryCount++;
    const referralCode = nanoid(10);
    inMemoryEntries.push({
      name,
      email: email.toLowerCase(),
      position: inMemoryCount,
      referralCode,
    });

    return NextResponse.json({
      position: inMemoryCount,
      referralCode,
      referralCount: 0,
    });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await connectDB();

    if (db) {
      const count = await WaitlistEntry.countDocuments();
      return NextResponse.json({ count });
    }

    // Fallback
    return NextResponse.json({ count: inMemoryCount });
  } catch (error) {
    console.error("Waitlist count error:", error);
    return NextResponse.json({ count: 1247 });
  }
}
