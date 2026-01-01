// backend\src\excel\excelParcer.ts
// 1. parseExcelBuffer
// Παίρνει ένα Buffer (αρχείο Excel ανεβασμένο στο Appwrite)
// και επιστρέφει έναν πίνακα από "καθαρά" προϊόντα
import * as XLSX from 'xlsx';
import { CommodityVariantType } from '../stripe/types/stripe.types';

// Η τελική μορφή που θέλουμε να πάρουμε από το Excel.
// Αυτή είναι η "καθαρή" και έτοιμη για χρήση δομή προϊόντος.
export interface CommodityExcelRow {
  uuid?: string;
  slug?: string;
  name: string;
  variants?: CommodityVariantType[];
  description: string;
  details: string;
  tips: string;
  category: string[]; // μετατροπή από comma-separated string → array
  price: number;
  stock: number;
  active: boolean;
  stripePriceId: string;
  images: string[]; // μετατροπή από comma-separated string → array
  requiresProcessing?: boolean;
  processingTimeDays?: number;
}

// Ένα ExcelParseResult είναι απλά ένας πίνακας από προϊόντα
export type ExcelParseResult = CommodityExcelRow[];

// RAW structure (όπως έρχεται από το Excel)
// Το Excel δεν εγγυάται ότι όλα τα κελιά έχουν σωστούς τύπους.
// Άρα εδώ ορίζουμε μια πιο "χαλαρή" μορφή με nullable + string values.
interface CommodityExcelRowRaw {
  uuid: string | null;
  slug: string | null;
  name: string | null;
  variants: string | null;
  description: string | null;
  details: string | null;
  tips: string | null;
  category: string | null;
  price: number | string | null;
  stock: number | string | null;
  active: boolean | string | null;
  stripePriceId: string | null;
  images: string | null;
  requiresProcessing: boolean | string | null;
  processingTimeDays: number | string | null;
}

// helper συναρτηση για την διαχείρηση των variants. Τα variants-attributes-active βρίσκονται στο excel μου σε μια μορφή σαν "size=S|color=red|_active=true ;"
// επιστρέφει array από variants, όπου κάθε variant έχει
// attributes (key=value pairs) και flag active (boolean)
// Παράδειγμα:
// input: // "size=S|color=red|_active=true ; size=M|color=blue|_active=0"
// output: [ { attributes: { size: "S", color: "red" }, active: true }, { attributes: { size: "M", color: "blue" }, active: false } ]
const parseVariantsFromExcel = (
  value: string | null
): CommodityVariantType[] | undefined => {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const variants = value
    // size=S|color=red|_active=true ; size=L|color=red|_active=true → size=S|color=red|_active=true
    .split(';')
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
    .map((variantStr) => {
      // size=S|color=red|_active=true → size=S color=red _active=true
      const parts = variantStr.split('|').map((p) => p.trim());

      const attributes: Record<string, string> = {};
      let active = true;

      for (const part of parts) {
        // _active=true → true/false ή _active=1
        if (part.startsWith('_active=')) {
          const raw = part.split('=')[1]?.trim().toLowerCase();
          active = raw === 'true' || raw === '1';
        } else {
          // size=S → key:size, val=S
          const [key, val] = part.split('=').map((s) => s.trim());
          if (key && val) {
            attributes[key] = val;
          }
        }
      }

      //Guard για κενά attributes
      if (Object.keys(attributes).length === 0) {
        return null;
      }

      return {
        attributes,
        active,
      };
    })
    .filter((v) => v !== null);

  return variants.length > 0 ? variants : undefined;
};

// parseExcelBuffer
// Παίρνει ένα Buffer (αρχείο Excel ανεβασμένο στο Appwrite)
// και επιστρέφει έναν πίνακα από "καθαρά" προϊόντα
export const parseExcelBuffer = (buffer: Buffer): ExcelParseResult => {
  // 1️⃣ Διαβάζουμε ολόκληρο το Excel workbook από το buffer
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  // 2️⃣ Παίρνουμε το πρώτο φύλλο εργασίας (Sheet1)
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 3️⃣ Μετατρέπουμε το sheet σε JSON.
  // - Το header της 1ης γραμμής γίνεται αυτόματα keys στο object.
  // - defval: null → αν υπάρχει άδειο κελί, βάλε null αντί undefined.
  const rawRows = XLSX.utils.sheet_to_json<CommodityExcelRowRaw>(worksheet, {
    defval: null,
  });

  // 4️⃣ Περνάμε κάθε raw row από φάση καθαρισμού (normalization)
  const products = rawRows.map((row) => ({
    uuid: row.uuid ?? undefined,
    slug: row.slug ?? undefined,
    // Αν κάποιο κελί είναι null → βάζουμε κενή τιμή
    name: row.name ?? '',
    variants: parseVariantsFromExcel(row.variants),
    description: row.description ?? '',
    details: row.details ?? '',
    tips: row.tips ?? '',
    // Category:
    // - Αν υπάρχει string π.χ. "cat1, cat2"
    // - Το κάνουμε .split(',') → ["cat1", "cat2"]
    category: row.category
      ? String(row.category)
        .split(',')
        .map((c) => c.trim())
      : [],
    // Price και stock:
    // - Μετατρέπουμε το value σε Number
    // - Αν αποτύχει → 0
    price: Number(row.price) || 0,
    stock: Number(row.stock) || 0,
    // Active:
    // - Αν στο Excel γράψει κάποιος "true" ή TRUE
    // - Το κάνουμε πραγματικό boolean
    active: (() => {
      if (row.active === true) {
        return true;
      }
      if (row.active === false) {
        return false;
      }

      const val = String(row.active).trim().toLowerCase();

      if (val === 'true') {
        return true;
      }
      if (val === 'false') {
        return false;
      }
      if (val === '1') {
        return true;
      }
      if (val === '0') {
        return false;
      }

      return false; // default
    })(),
    // Stripe price ID:
    // - Μετατρέπουμε πάντα σε string
    stripePriceId: String(row.stripePriceId ?? ''),
    // Images:
    // - Αν υπάρχει string "a.jpg, b.jpg"
    // - Το κάνουμε array ["a.jpg", "b.jpg"]
    images: row.images
      ? String(row.images)
        .split(',')
        .map((i) => i.trim())
      : [],
    requiresProcessing: (() => {
      if (row.requiresProcessing === true) {
        return true;
      }
      if (row.requiresProcessing === false) {
        return false;
      }
      const val = String(row.requiresProcessing).trim().toLowerCase();
      return val === 'true' || val === '1';
    })(),
    processingTimeDays:
      row.processingTimeDays !== null && row.processingTimeDays !== ''
        ? Number(row.processingTimeDays)
        : undefined,
  }));

  // Debug (προαιρετικά)
  // console.log('products (excelParser)(remove):', products);

  return products;
};
