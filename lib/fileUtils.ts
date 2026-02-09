// lib/fileUtils.ts
// Client-side file processing utility for images and PDFs

/**
 * Supported file types
 */
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const SUPPORTED_PDF_TYPES = ['application/pdf'];
export const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_PDF_TYPES];

/**
 * Resizes an image file to a maximum width while maintaining aspect ratio.
 * Outputs as JPEG with 80% quality to reduce payload size.
 */
export async function resizeImage(file: File, maxWidth = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      } finally {
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
 * Converts a PDF file to base64
 */
export async function pdfToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read PDF file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Process any supported file (image or PDF)
 */
export async function processFile(file: File, maxImageWidth = 1024): Promise<{ data: string; type: 'image' | 'pdf' }> {
  if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    const data = await resizeImage(file, maxImageWidth);
    return { data, type: 'image' };
  }
  
  if (SUPPORTED_PDF_TYPES.includes(file.type)) {
    const data = await pdfToBase64(file);
    return { data, type: 'pdf' };
  }
  
  throw new Error(`Unsupported file type: ${file.type}`);
}

/**
 * Validates file type and size before processing
 */
export function validateFile(file: File, maxSizeMB = 10): { valid: boolean; error?: string } {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Please upload an image (JPEG, PNG, WebP, GIF) or PDF file' 
    };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File must be smaller than ${maxSizeMB}MB` };
  }
  
  return { valid: true };
}

// Keep old exports for backward compatibility
export const validateImageFile = validateFile;
