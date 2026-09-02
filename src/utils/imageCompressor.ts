/**
 * Utility to compress client-uploaded images (e.g., Gift Card front/back, receipts)
 * into lightweight, high-clarity base64 Data URLs suitable for Firestore and fast preview.
 */

// Helper to convert Blob/File directly to raw Data URL as ultimate fallback
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file as data URL'));
      }
    };
    reader.onerror = () => {
      reject(new Error(reader.error?.message || 'FileReader failed to read image'));
    };
    reader.readAsDataURL(file);
  });
}

export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.75
): Promise<string> {
  if (!file) {
    throw new Error('No file provided for compression');
  }

  // Strategy 1: Modern createImageBitmap (fastest & handles orientations natively)
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file);
      let width = bitmap.width;
      let height = bitmap.height;

      if (width > 0 && height > 0) {
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(bitmap, 0, 0, width, height);
          bitmap.close?.();

          // Try exporting to jpeg or fallback to default dataURL
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          if (dataUrl && dataUrl.startsWith('data:image/')) {
            return dataUrl;
          }
        }
      }
    } catch {
      // Fall through to Strategy 2
    }
  }

  // Strategy 2: URL.createObjectURL + HTMLImageElement
  try {
    const compressed = await new Promise<string>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (!width || !height) {
            URL.revokeObjectURL(objectUrl);
            resolve(''); // will trigger raw fallback
            return;
          }

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            resolve('');
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(objectUrl);

          const result = canvas.toDataURL('image/jpeg', quality);
          resolve(result);
        } catch {
          URL.revokeObjectURL(objectUrl);
          resolve('');
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // Do not reject with raw DOM Event; resolve empty to trigger strategy 3
        resolve('');
      };

      img.src = objectUrl;
    });

    if (compressed && compressed.startsWith('data:image/')) {
      return compressed;
    }
  } catch {
    // Fall through to Strategy 3
  }

  // Strategy 3: Fallback to reading raw file data URL directly
  try {
    const rawDataUrl = await readFileAsDataURL(file);
    return rawDataUrl;
  } catch (err: any) {
    throw new Error(err?.message || 'Unable to process image file. Please choose a valid JPG or PNG photo.');
  }
}

