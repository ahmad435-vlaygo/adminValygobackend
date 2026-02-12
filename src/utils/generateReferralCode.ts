export const generateReferralCode = (email: string): string => {
  const timestamp = Date.now().toString(36);
  const emailHash = email.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${emailHash}${timestamp}${random}`;
};
