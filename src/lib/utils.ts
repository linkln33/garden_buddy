/**
 * Utility functions for Garden Buddy
 */

/**
 * Convert a base64 string to a Blob
 * @param base64Data - Base64 encoded string (can be raw or data URI format)
 * @returns Blob object
 */
export function base64ToBlob(base64Data: string): Blob {
  try {
    // Handle data URI format (e.g., "data:image/jpeg;base64,/9j/4AAQ...")
    let base64String = base64Data;
    let contentType = 'image/jpeg'; // Default content type
    
    if (base64Data.startsWith('data:')) {
      const parts = base64Data.split(';base64,');
      if (parts.length === 2) {
        contentType = parts[0].split(':')[1];
        base64String = parts[1];
      }
    }
    
    // Convert base64 to binary
    const byteCharacters = atob(base64String);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: contentType });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    // Fallback to a minimal valid blob
    return new Blob(['error'], { type: 'text/plain' });
  }
}

/**
 * Format a confidence score to ensure it's between 0 and 1
 * @param score - Raw confidence score
 * @returns Normalized confidence score between 0 and 1
 */
export function normalizeConfidenceScore(score: number): number {
  if (score === undefined || score === null) {
    return 0;
  }
  
  // If score is already between 0 and 1, return as is
  if (score >= 0 && score <= 1) {
    return score;
  }
  
  // If score is between 0 and 100, normalize to 0-1
  if (score >= 0 && score <= 100) {
    return score / 100;
  }
  
  // For any other values, clamp between 0 and 1
  return Math.max(0, Math.min(1, score));
}
