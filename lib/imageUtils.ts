// lib/imageUtils.ts
// Client-side image resize utility to avoid Edge Runtime payload limits

/**
 * Resizes an image file to a maximum width while maintaining aspect ratio.
 * Outputs as JPEG with 80% quality to reduce payload size.
 * 
 * @param file - The image file to resize
 * @param maxWidth - Maximum width in pixels (default: 1024)
 * @returns Base64 data URL of the resized image
 */
export async function resizeImage(file: File, maxWidth = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw resized image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 JPEG (smaller than PNG)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      } finally {
        // Cleanup
        URL.revokeObjectURL(img.src);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validates image file type and size before processing
 * 
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10)
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File, maxSizeMB = 10): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPEG, PNG, WebP, or GIF image' };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Image must be smaller than ${maxSizeMB}MB` };
  }
  
  return { valid: true };
}
