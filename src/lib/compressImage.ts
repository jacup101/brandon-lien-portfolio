// Client-side image compression for the hosted admin UI. There's no
// server here to run sharp the way the local admin tool does — this is
// exactly the "compress in the browser before upload" approach decided on
// when site-assets-backend was designed (a Worker can't run sharp either).
const MAX_WIDTH = 1000;
const JPEG_QUALITY = 0.9;

export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image compression failed.'))),
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}
