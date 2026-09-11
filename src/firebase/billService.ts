import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import type { CartItem, BillCalculation } from "../types";

interface SaveBillPayload {
  cartItems: CartItem[];
  bill: BillCalculation;
}

export async function saveBillToFirestore({
  cartItems,
  bill,
}: SaveBillPayload): Promise<string> {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env and fill in your credentials.",
    );
  }

  const docRef = await addDoc(collection(db, "bills"), {
    items: cartItems.map(({ product, quantity }) => ({
      productId: product.id,
      productName: product.name,
      pricePence: product.pricePence,
      quantity,
    })),
    subtotalPence: bill.subtotalPence,
    offers: bill.offers,
    totalSavingsPence: bill.totalSavingsPence,
    finalTotalPence: bill.finalTotalPence,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
