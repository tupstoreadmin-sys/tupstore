// Single source of truth for the store's real production social/contact
// links — same centralization pattern as STORE_WHATSAPP_NUMBER in
// whatsapp.js. Consumed by Header/MobileMenu/Footer (via App.jsx) and any
// other CTA that links out to one of these destinations, instead of each
// call site hardcoding its own copy of the same URL.
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/thetupperwarestore',
  facebook: 'https://www.facebook.com/TheTupperwareStore',
  youtube: 'https://www.youtube.com/@TheTupperwareStore',
  whatsappChannel: 'https://www.whatsapp.com/channel/0029Va9G3LTAu3aRp55Ycm3X',
  googleReviews:
    'https://www.google.com/maps/place/Tupperware/@9.4302025,76.5416516,17z/data=!3m1!4b1!4m6!3m5!1s0x3b0627006cf26d6d:0xff1cf0d5f36a40a!8m2!3d9.4302025!4d76.5442265!16s%2Fg%2F11y_k6sbj9?entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D',
  storeLocation:
    'https://www.google.com/maps/place/Tupperware/@9.3407396,76.4420351,12z/data=!4m6!3m5!1s0x3b0627006cf26d6d:0xff1cf0d5f36a40a!8m2!3d9.4302025!4d76.5442265!16s%2Fg%2F11y_k6sbj9?entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D',
}
