import axios from "axios";
import { API_URL, getAuthHeaders } from "@/lib/auth-client";

export function useKhaltiPayment() {
  async function buyImage(imageId: string) {
    try {
      const authHeaders = await getAuthHeaders();
      const { data } = await axios.post(
        `${API_URL}/payments/initiate`,
        { imageId },
        { headers: authHeaders }
      );
      return { paymentUrl: data.paymentUrl, pidx: data.pidx };
    } catch (err: any) {
      throw new Error(err.response?.data?.error ?? "Payment initiation failed");
    }
  }

  async function getFreeDownload(imageId: string) {
    try {
      const authHeaders = await getAuthHeaders();
      const { data } = await axios.post(
        `${API_URL}/payments/free`,
        { imageId },
        { headers: authHeaders }
      );
      return data.imageUrl; 
    } catch (err: any) {
      throw new Error(err.response?.data?.error ?? "Free download failed");
    }
  }

  return { buyImage, getFreeDownload };
}
