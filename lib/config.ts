// Centralized configuration for contact information
export const CONTACT_CONFIG = {
  // WhatsApp configuration
  whatsapp: {
    number: "355690000000, // Your WhatsApp number (without + sign)
    displayNumber: "Whatsapp", // How the number appears to users
  },

  // Email configuration
  email: {
    address: "tplsclub@gmail.com", // Your email address
    displayName: "Email", // Display name for emails
  },

  // Social media links (for future use)
  social: {
    facebook: "https://facebook.com/theplayersclub",
    instagram: "https://instagram.com/thepl4yers",
    tiktok: "https://tiktok.com/@theplayersclub",
  },

  // Business information
  business: {
    name: "The Players Club",
    copyright: "Copyright © 2025 - The Players Club",
  },
}

// Helper functions for generating contact URLs
export const generateWhatsAppUrl = (message: string): string => {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${CONTACT_CONFIG.whatsapp.number}?text=${encodedMessage}`
}

export const generateEmailUrl = (subject: string, body: string): string => {
  const encodedSubject = encodeURIComponent(subject)
  const encodedBody = encodeURIComponent(body)
  return `mailto:${CONTACT_CONFIG.email.address}?subject=${encodedSubject}&body=${encodedBody}`
}
