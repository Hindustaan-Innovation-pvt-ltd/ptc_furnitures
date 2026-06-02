import { randomUUID } from "node:crypto";
import { connectToDatabase } from "./mongodb";
import { DealerLeadModel } from "./db-models";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export type DealerLead = {
  id: string;
  name: string;
  phone: string;
  city: string;
  email?: string;
  createdAt: string;
  status: "new" | "contacted" | "approved" | "rejected";
  whatsappStatus?: "sent" | "failed";
  whatsappSentAt?: string;
  whatsappMessage?: string;
};

export type DealerLeadInput = {
  name: string;
  phone: string;
  city: string;
  email?: string;
};

export async function readLeads(): Promise<DealerLead[]> {
  await connectToDatabase();
  const docs = await DealerLeadModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    phone: doc.phone,
    city: doc.city,
    email: doc.email || undefined,
    createdAt: doc.createdAt,
    status: doc.status || "new",
    whatsappStatus: doc.whatsappStatus || undefined,
    whatsappSentAt: doc.whatsappSentAt || undefined,
    whatsappMessage: doc.whatsappMessage || undefined,
  }));
}

export async function writeLeads(leads: DealerLead[]): Promise<void> {
  // Deprecated no-op
}

export async function addLead(input: DealerLeadInput): Promise<DealerLead> {
  await connectToDatabase();

  const newLead: DealerLead = {
    id: `LD-${randomUUID().substring(0, 8).toUpperCase()}`,
    name: input.name.trim(),
    phone: input.phone.trim(),
    city: input.city.trim(),
    email: input.email?.trim() || undefined,
    createdAt: new Date().toISOString(),
    status: "new",
  };

  await DealerLeadModel.create(newLead);

  // Sync to Firebase Firestore
  try {
    const leadDocRef = doc(db, "leads", newLead.id);
    await setDoc(leadDocRef, {
      ...newLead,
      email: newLead.email || null,
      whatsappStatus: newLead.whatsappStatus || null,
      whatsappSentAt: newLead.whatsappSentAt || null,
      whatsappMessage: newLead.whatsappMessage || null,
    });
    console.log(`[Firebase] Lead successfully synced to Firestore: ${newLead.id}`);
  } catch (error) {
    console.error("[Firebase] Firestore sync failed:", error);
  }

  return newLead;
}

export async function updateLead(
  id: string,
  updates: Partial<DealerLead>
): Promise<DealerLead | null> {
  await connectToDatabase();

  const existing = await DealerLeadModel.findOne({ id });
  if (!existing) {
    return null;
  }

  const cleanUpdates: any = {};
  if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
  if (updates.phone !== undefined) cleanUpdates.phone = updates.phone.trim();
  if (updates.city !== undefined) cleanUpdates.city = updates.city.trim();
  if (updates.email !== undefined) cleanUpdates.email = updates.email.trim() || undefined;
  if (updates.status !== undefined) cleanUpdates.status = updates.status;
  if (updates.whatsappStatus !== undefined) cleanUpdates.whatsappStatus = updates.whatsappStatus;
  if (updates.whatsappSentAt !== undefined) cleanUpdates.whatsappSentAt = updates.whatsappSentAt;
  if (updates.whatsappMessage !== undefined) cleanUpdates.whatsappMessage = updates.whatsappMessage;

  const doc = await DealerLeadModel.findOneAndUpdate(
    { id },
    { $set: cleanUpdates },
    { new: true }
  ).lean();

  if (!doc) {
    return null;
  }

  // Sync updates to Firebase Firestore
  try {
    const leadDocRef = doc(db, "leads", id);
    // Convert undefined updates to null or omit for Firestore compatibility
    const firestoreUpdates = { ...cleanUpdates };
    if (firestoreUpdates.email === undefined && cleanUpdates.email === null) {
      firestoreUpdates.email = null;
    }
    await setDoc(leadDocRef, firestoreUpdates, { merge: true });
    console.log(`[Firebase] Lead successfully updated in Firestore: ${id}`);
  } catch (error) {
    console.error("[Firebase] Firestore update failed:", error);
  }

  return {
    id: doc.id,
    name: doc.name,
    phone: doc.phone,
    city: doc.city,
    email: doc.email || undefined,
    createdAt: doc.createdAt,
    status: doc.status || "new",
    whatsappStatus: doc.whatsappStatus || undefined,
    whatsappSentAt: doc.whatsappSentAt || undefined,
    whatsappMessage: doc.whatsappMessage || undefined,
  };
}

export async function updateLeadStatus(
  id: string,
  status: DealerLead["status"]
): Promise<DealerLead | null> {
  return updateLead(id, { status });
}

export async function deleteLead(id: string): Promise<DealerLead | null> {
  await connectToDatabase();

  const doc = await DealerLeadModel.findOneAndDelete({ id }).lean();
  if (!doc) {
    return null;
  }

  return {
    id: doc.id,
    name: doc.name,
    phone: doc.phone,
    city: doc.city,
    email: doc.email || undefined,
    createdAt: doc.createdAt,
    status: doc.status || "new",
    whatsappStatus: doc.whatsappStatus || undefined,
    whatsappSentAt: doc.whatsappSentAt || undefined,
    whatsappMessage: doc.whatsappMessage || undefined,
  };
}

export async function updateLeadWhatsAppStatus(
  id: string,
  whatsappStatus: "sent" | "failed",
  whatsappMessage: string
): Promise<DealerLead | null> {
  return updateLead(id, {
    whatsappStatus,
    whatsappSentAt: new Date().toISOString(),
    whatsappMessage,
  });
}
