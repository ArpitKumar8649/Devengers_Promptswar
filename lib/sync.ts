"use client";

import type { User } from "firebase/auth";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { getDb } from "./firebase";
import type { Complaint } from "./types";

/**
 * Best-effort cloud sync of complaints to Firestore under users/{uid}/complaints.
 * localStorage remains the source of truth; every call here is guarded so a
 * missing Firestore / denied rules / offline state NEVER breaks the app.
 */
export async function pushComplaintToCloud(user: User | null, c: Complaint) {
  const db = getDb();
  if (!db || !user) return;
  try {
    await setDoc(doc(db, "users", user.uid, "complaints", c.id), c);
  } catch (err) {
    console.error("cloud push failed (ignored):", (err as Error).message);
  }
}

export async function pullComplaintsFromCloud(user: User | null): Promise<Complaint[]> {
  const db = getDb();
  if (!db || !user) return [];
  try {
    const snap = await getDocs(collection(db, "users", user.uid, "complaints"));
    return snap.docs.map((d) => d.data() as Complaint);
  } catch (err) {
    console.error("cloud pull failed (ignored):", (err as Error).message);
    return [];
  }
}
