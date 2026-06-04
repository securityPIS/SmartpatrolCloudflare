/**
 * Reads an image File and returns a downscaled JPEG data URL. Keeping the
 * onboarding selfie small (default ≤320px) means it fits comfortably in the
 * registration payload and D1 row for admin review.
 */
export function fileToDownscaledDataUrl(
  file: File,
  maxSize = 320,
  quality = 0.72,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("File bukan gambar yang valid."));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas tidak tersedia."));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
