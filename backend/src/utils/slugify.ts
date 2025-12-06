// backend\src\utils\slugify.ts

const greekMap: Record<string, string> = {
  ά: 'a', α: 'a', β: 'v', γ: 'g', δ: 'd',
  έ: 'e', ε: 'e', ζ: 'z', ή: 'i', η: 'i',
  θ: 'th', ί: 'i', ι: 'i', κ: 'k', λ: 'l',
  μ: 'm', ν: 'n', ξ: 'x', ό: 'o', ο: 'o',
  π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't',
  ύ: 'y', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps',
  ώ: 'o', ω: 'o',
};

// string in, string out
// Μετατρέπει ελληνικούς χαρακτήρες σε λατινικούς
const transliterateGreek = (str: string): string => {
  return str
    .toLowerCase()
    .split('')
    .map(ch => greekMap[ch] ?? ch) // αν δεν υπάρχει στο map, μένει ως έχει
    .join('');
};

export const slugify = (str: string): string => {
  const transliterated = transliterateGreek(str);

  return transliterated
    .normalize('NFD')                 // Διαχωρίζει γράμμα + τόνο (π.χ. á → a + ́ )
    .replace(/[\u0300-\u036f]/g, '')  // Αφαιρεί τους τόνους (διακριτικά)
    .replace(/[^a-z0-9]+/g, '-')      // Μετατρέπει κάθε μη-αλφαριθμητικό σε παύλα
    .replace(/^-+|-+$/g, '');         // Καθαρίζει παύλες στην αρχή ή στο τέλος
};
