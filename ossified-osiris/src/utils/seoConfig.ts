/**
 * SEO Configuration and Utilities for Share Text Pad
 */

export const SITE_CONFIG = {
  name: 'Share Text Pad',
  description: 'A fast, modern collaborative notepad with real-time editing, QR sharing, and version history.',
  url: 'http://localhost:4321',
  twitter: '@sharetextpad',
  author: 'Share Text Pad',
};

export const PAGES_SEO = {
  home: {
    title: 'Share Text Pad - Real-Time Collaborative Notepad',
    description: 'A fast, modern collaborative notepad with real-time editing, QR sharing, and version history.',
    ogType: 'website',
  },
  note: (id: string) => ({
    title: `Collaborative Note (${id}) - Share Text Pad`,
    description: 'Edit this note in real-time with others. No sign-up required.',
    ogType: 'article' as const,
  }),
  notFound: {
    title: 'Page Not Found - Share Text Pad',
    description: 'The page you are looking for does not exist.',
    ogType: 'website',
  },
};

/**
 * Helper function to generate meta title
 */
export const generateTitle = (pageTitle: string, includeSiteName = true): string => {
  if (includeSiteName && !pageTitle.includes('Share Text Pad')) {
    return `${pageTitle} | Share Text Pad`;
  }
  return pageTitle;
};

/**
 * Helper function to generate meta description
 */
export const generateDescription = (description: string, maxLength = 160): string => {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength - 3) + '...';
};

/**
 * Validate canonical URL format
 */
export const validateCanonicalUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Open Graph Image configuration
 */
export const OG_IMAGES = {
  default: '/og-image.png',
  home: '/og-image.png',
  note: '/og-image-note.png',
};

/**
 * Social Media Handles
 */
export const SOCIAL_HANDLES = {
  twitter: '@sharetextpad',
  github: 'riteshk98/share-text-pad',
};
