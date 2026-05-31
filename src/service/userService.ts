import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { WebDetails } from "@/model/types";
import { signInWithEmailAndPassword, signOut,createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const DOC_ID = "business";

export const saveWebDetails = async (details: WebDetails) => {
  await setDoc(doc(db, "webDetails", DOC_ID), details);
};

export const getWebDetails = async (): Promise<WebDetails | null> => {
  const snap = await getDoc(doc(db, "webDetails", DOC_ID));

  if (!snap.exists()) return null;

  return snap.data() as WebDetails;
};

export const loginAdmin = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutAdmin = async () => {
  return signOut(auth);
};

