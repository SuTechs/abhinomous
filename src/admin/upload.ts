import { MEDIA_BUCKET, supabase } from '../lib/supabase';

const MAX_SIDE = 2000;

/** Shrinks big phone photos to at most 2000px (WebP) before upload. */
async function shrink(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

/** Uploads an image to the public media bucket and returns its URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const blob = await shrink(file);
  const ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: blob.type || file.type,
    cacheControl: '31536000',
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
