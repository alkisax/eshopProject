export const validateFullName = (value: string): string | null => {
  if (!value.trim()) return "Full name is required";
  if (value.trim().length < 3) return "Full name must be at least 3 characters";
  return null;
};

export const validatePostalCode = (value: string): string | null => {
  const regex = /^[0-9]{4,6}$/; 
  if (!regex.test(value)) return "Invalid postal code";
  return null;
};

export const validatePhone = (value: string): string | null => {
  const regex = /^[+0-9\s-]{7,15}$/;
  if (!regex.test(value)) return "Invalid phone number";
  return null;
};
