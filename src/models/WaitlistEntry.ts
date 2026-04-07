import mongoose, { Schema, Document } from "mongoose";

export interface IWaitlistEntry extends Document {
  name: string;
  email: string;
  city?: string;
  state?: string;
  country: string;
  locale: string;
  position: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  status: "pending" | "confirmed" | "invited" | "converted";
  confirmedAt?: Date;
  source?: string;
  campaign?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistEntrySchema = new Schema<IWaitlistEntry>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, default: "BR" },
    locale: { type: String, default: "pt-BR" },
    position: { type: Number, required: true },
    referralCode: { type: String, required: true, unique: true },
    referredBy: { type: String },
    referralCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "invited", "converted"],
      default: "pending",
    },
    confirmedAt: { type: Date },
    source: { type: String },
    campaign: { type: String },
  },
  { timestamps: true }
);

export const WaitlistEntry =
  mongoose.models.WaitlistEntry ||
  mongoose.model<IWaitlistEntry>("WaitlistEntry", WaitlistEntrySchema);
