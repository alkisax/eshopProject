// backend\src\excel\excelParcer.ts
// 1. parseExcelBuffer
// Παίρνει ένα Buffer (αρχείο Excel ανεβασμένο στο Appwrite)
// και επιστρέφει έναν πίνακα από "καθαρά" προϊόντα
import * as XLSX from 'xlsx';

// Η τελική μορφή που θέλουμε να πάρουμε από το Excel.
// Αυτή είναι η "καθαρή" και έτοιμη για χρήση δομή προϊόντος.
export interface CommodityExcelRow {
  uuid?: string;
  slug?: string;  
  name: string;
  description: string;
  category: string[];       // μετατροπή από comma-separated string → array
  price: number;
  stock: number;
  active: boolean;
  stripePriceId: string;
  images: string[];         // μετατροπή από comma-separated string → array
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
  description: string | null;
  category: string | null;
  price: number | string | null;
  stock: number | string | null;
  active: boolean | string | null;
  stripePriceId: string | null;
  images: string | null;
}

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
    description: row.description ?? '',
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
    active: row.active === 'true' || row.active === true,
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
  }));

  // Debug (προαιρετικά)
  // console.log('products (excelParser)(remove):', products);

  return products;
};
