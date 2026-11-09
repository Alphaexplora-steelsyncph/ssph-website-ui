/** Member photos never go over this size (the server refuses anything above 300 KB). */
export const MAX_PHOTO_BYTES = 200 * 1024

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))

/**
 * Crops an image to a centred square, shrinks it to `size` px and compresses it to at most `maxBytes`.
 * WebP when the browser can make it (about a third smaller than JPEG), JPEG otherwise. Quality steps down,
 * then the size, until the file fits. Phone photos are several MB; a face needs a fraction of that, which keeps
 * uploads fast and Supabase storage and egress low. No library needed: the browser's canvas does the work.
 */
export const resizeToSquareJpeg = async (file: Blob, size = 512, quality = 0.85, maxBytes = MAX_PHOTO_BYTES): Promise<Blob> => {
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) throw new Error('That file could not be read as an image.')
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser cannot process this photo.')

  try {
    for (let px = size; px >= 256; px = Math.round(px * 0.75)) {
      canvas.width = px
      canvas.height = px
      ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, px, px)
      for (let q = quality; q >= 0.5; q -= 0.1) {
        // Browsers that cannot make WebP return a PNG instead: use JPEG there.
        let blob = await toBlob(canvas, 'image/webp', q)
        if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', q)
        if (blob && blob.size <= maxBytes) return blob
      }
    }
  } finally {
    bitmap.close()
  }
  throw new Error('Could not make the photo small enough. Try another photo.')
}
