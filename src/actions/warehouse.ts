"use server";

import { revalidatePath } from "next/cache";

export async function receiveRM(barcode: string) {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/stock/receive-rm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barcode }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to receive RM");
    }

    revalidatePath("/stock/inward");
    return data;
  } catch (error: any) {
    console.error("Error receiving RM:", error);
    return { success: false, error: error.message };
  }
}

export async function verifyMixingBOM(jobCardId: string, resinBarcode: string, masterbatchBarcode: string) {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/stock/verify-mixing-bom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobCardId, resinBarcode, masterbatchBarcode }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Mismatch Detected! Components do not match BOM.");
    }

    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
