import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";

export const contentImageService = {
  async upload(file: File | Blob): Promise<string> {
    const formData = new FormData();
    formData.append("image", file, "image.png");

    const { data } = await apiClient.post<{ url: string }>(
      API_ENDPOINTS.admin.contentImages,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.url;
  },
};
