/**
 * LinkedIn URL validation and formatting utilities
 */

export interface LinkedInUrlValidation {
  isValid: boolean;
  normalizedUrl: string;
  error?: string;
}

/**
 * Validates and normalizes a LinkedIn profile URL
 */
export const validateAndNormalizeLinkedInUrl = (url: string): LinkedInUrlValidation => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'URL is required'
    };
  }

  // Trim and clean the URL
  let cleanUrl = url.trim();
  
  // Ensure it starts with http:// or https://
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  
  // Remove any tracking parameters
  cleanUrl = cleanUrl.split('?')[0];
  
  // Remove trailing slash
  cleanUrl = cleanUrl.replace(/\/$/, '');
  
  // Convert to lowercase for consistency
  cleanUrl = cleanUrl.toLowerCase();
  
  // Validate the URL pattern
  const validPatterns = [
    /^https:\/\/www\.linkedin\.com\/in\/[a-z0-9-]+$/,
    /^https:\/\/linkedin\.com\/in\/[a-z0-9-]+$/,
    /^https:\/\/www\.linkedin\.com\/profile\/view\?id=[0-9]+$/,
    /^https:\/\/linkedin\.com\/profile\/view\?id=[0-9]+$/
  ];
  
  const isValid = validPatterns.some(pattern => pattern.test(cleanUrl));
  
  if (!isValid) {
    return {
      isValid: false,
      normalizedUrl: cleanUrl,
      error: 'Invalid LinkedIn URL format'
    };
  }
  
  // Normalize to www.linkedin.com format
  let normalizedUrl = cleanUrl;
  if (normalizedUrl.startsWith('https://linkedin.com')) {
    normalizedUrl = normalizedUrl.replace('https://linkedin.com', 'https://www.linkedin.com');
  }
  
  return {
    isValid: true,
    normalizedUrl
  };
};

/**
 * Extracts the LinkedIn username from a URL
 */
export const extractLinkedInUsername = (url: string): string | null => {
  const validation = validateAndNormalizeLinkedInUrl(url);
  if (!validation.isValid) return null;
  
  const match = validation.normalizedUrl.match(/\/in\/([a-z0-9-]+)$/);
  return match ? match[1] : null;
};

/**
 * Generates a realistic LinkedIn profile URL from a name and email
 */
export const generateRealisticLinkedInUrl = (name: string, email: string): string => {
  if (!name && !email) {
    return '';
  }
  
  let username = '';
  
  if (name) {
    // Clean the name for URL
    username = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Spaces to hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .substring(0, 50); // Limit length
  } else if (email) {
    // Use email username if no name
    username = email.split('@')[0].toLowerCase();
  }
  
  if (!username) {
    return '';
  }
  
  const url = `https://www.linkedin.com/in/${username}`;
  const validation = validateAndNormalizeLinkedInUrl(url);
  
  return validation.isValid ? validation.normalizedUrl : '';
};

/**
 * Checks if a URL looks like a valid LinkedIn profile
 */
export const isLikelyValidLinkedInProfile = (url: string): boolean => {
  const validation = validateAndNormalizeLinkedInUrl(url);
  if (!validation.isValid) return false;
  
  // Additional checks for realistic profile URLs
  const username = extractLinkedInUsername(validation.normalizedUrl);
  if (!username) return false;
  
  // Check for reasonable username length and pattern
  if (username.length < 3 || username.length > 50) return false;
  if (!/^[a-z0-9-]+$/.test(username)) return false;
  if (username.includes('--')) return false; // No consecutive hyphens
  
  return true;
};