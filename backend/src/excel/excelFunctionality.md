- θέλουμε να έχουμε ένα excel αρχείο που θα έχει όλα τα προιόντα που είναι να προστεθούν.
- το excel έχει ένα πεδίο images με url εικονών ή με τα filename (με extension) των εικονών που αντιστοιχούν στα προιόντα
- αυτό είναι δουλειά του frontend για αυτό αρχικά προσθέτουμε manualy το excel και ένα αρχείο zip με τις εικόνες στο appwrite

### 1. app.ts

```ts
import excelRoutes from './excel/routes/excel.routes';
app.use('/api/excel', excelRoutes);
```

απλώς το αντιστοιχούμε με τον router

### 2. backend\src\excel\routes\excel.routes.ts

απλώς καλεί τον controller και δημιουργεί ένα endpoint

```ts
router.post('/import', importProductsFromExcel);
```

### 3. backend\src\excel\controllers\excel.import.controller.ts

- backend\src\excel\utils\downloadExcelFromAppwrite.ts
  input → το id του excel αρχείου απο το appwrite
  output → buffer excel

```ts
// παίρνει απο το front τα id και όνομα του excel και το id του zip
const { fileId, originalName, zipFileId } = req.body;

// καλεί την συνάρτηση που φτιάξαμε για το download, τώρα η excelBuffer έχει ως buffer όλο το αρχείο excel
const excelBuffer = await downloadExcelFromAppwrite(fileId);
```

- η downloadExcelFromAppwrite

```ts
// Κατεβάζει ένα excel από το Appwrite και το επιστρέφει ως Buffer.
export const downloadExcelFromAppwrite = async (
  fileId: string
): Promise<Buffer> => {
  const arrayBuffer = await storage.getFileDownload({
    bucketId: process.env.APPWRITE_BUCKET_ID!,
    fileId,
  });

  return Buffer.from(arrayBuffer);
};
```

### 4. parse excel - controller

καλεί τον parser που έχουμε φτιάξει
input → το buffer του excel
output → ενα arrray με objects απο όλα τα εμπορεύματα που έχει μέσα το excel

το output έίναι τύπου

```ts
export type ExcelParseResult = CommodityExcelRow[];
export interface CommodityExcelRow {
  name: string;
  description: string;
  category: string[]; // μετατροπή από comma-separated string → array
  price: number;
  stock: number;
  active: boolean;
  stripePriceId: string;
  images: string[]; // μετατροπή από comma-separated string → array
}
```

controller:

```ts
let products = parseExcelBuffer(excelBuffer);
```

- η parseExcelBuffer

```ts
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
```

### 5. analysis of each excel files (urls, filenames, mixed) - controller

είχαμε το εξής πρόβλημα. το κάθε προιόν του excel θα μπορούσε να έχει εικόνες ως url, θα μπορούσε να τις έχει ως filename και θα μπορούσε να τις έχει και μικτά. Τέλος θα μπορούσε να έχει λάθη ή να μην έχει ανέβει .zip με εικόνες. Για αυτό φτιάξαμε έναν αναλυτη του input για κάθε product

η analyzeImagesInput επιστρέφει για κάθε προιόν ένα αποτέλεσμα τύπου

```ts
export interface ImageAnalysisResult {
  type: 'urls' | 'filenames' | 'empty' | 'mixed';
  images: string[];
  hasWrongNames: boolean;
}
```

controller:

```ts
// 4. Αναλύουμε ΤΟ ΚΑΘΕ προϊόν ξεχωριστά ως προς τα images
const analysisResults = products.map((p) => analyzeImagesInput(p));
```

- η analyzeImagesInput

```ts
export const analyzeImagesInput = (
  product: CommodityExcelRow
): ImageAnalysisResult => {
  // ενα array μετα sting των Images απο excel
  const images = product.images;

  if (!images || images.length === 0) {
    return { type: 'empty', images: [], hasWrongNames: false };
  }

  let urlCount = 0;
  let filenameCount = 0;
  let wrongCount = 0;

  for (const img of images) {
    if (isUrl(img)) {
      urlCount++;
    } else if (isFilename(img)) {
      filenameCount++;
    } else {
      // Ούτε URL ούτε filename
      // ΤΟ ΠΕΤΑΜΕ από την λίστα
      console.warn(`⚠️ Excel: invalid image entry ignored: '${img}'`);
      wrongCount++;
    }
  }

  const hasWrongNames = wrongCount > 0;

  // Αν δεν βγήκε κάτι έγκυρο
  if (urlCount === 0 && filenameCount === 0) {
    return { type: 'empty', images: [], hasWrongNames };
  }

  // ΜΟΝΟ URLs
  if (urlCount > 0 && filenameCount === 0) {
    return { type: 'urls', images, hasWrongNames };
  }

  // ΜΟΝΟ filenames
  if (filenameCount > 0 && urlCount === 0) {
    return { type: 'filenames', images, hasWrongNames };
  }

  // Μικτό
  return { type: 'mixed', images, hasWrongNames };
};
```

### 6. handle mixed or hasWrongNames with message and placeholder for future logic - controller

controller:

```ts
// Flag: έστω ΕΝΑ προϊόν χρειάζεται ZIP ;
const zipNeeded = analysisResults.some((result) => result.type === 'filenames');

// Εδώ θα μαζεύουμε warnings για το response
const warnings: string[] = [];
```

δεν έχουμε φτιάξει ακόμα την λογική αν ένα εμπόρευμα έχει mixed urls & filename για αυτό και έχουμε έναν placeholder για αυτά

```ts
// 5. Placeholder λογική για mixed / hasWrongNames
analysisResults.forEach((result, index) => {
  if (result.type === 'mixed') {
    warnings.push(
      `Product '${products[index].name}' has mixed URLs + filenames (NOT supported yet)`
    );
    // Placeholder future logic: skip or fix
  }

  if (result.hasWrongNames) {
    warnings.push(
      `Product '${products[index].name}' has invalid image names that were ignored`
    );
    // Placeholder: μπορεί να γίνει reject product στο μέλλον
  }
});
```

### 7. add products with urls in images or no images

- αν δεν χρειάζετε zip απλώς τα κάνει add

```ts
// 6️⃣ Αν ΔΕΝ χρειάζεται ZIP → bypass images processing
// η addProductsFromExcel είναι util που φτιάξαμε εμείς, στο data θα επιστρέψει ένα obj τύπου   const results = { created: 0, updated: 0, errors: [] as string[] };
if (!zipNeeded) {
  const saveResult = await addProductsFromExcel(products);
  return res.status(201).json({
    status: true,
    message: 'Products imported successfully (no ZIP required)',
    warnings,
    data: saveResult,
  });
}
```

- η addProductsFromExcel

```ts
export const addProductsFromExcel = async (products: CommodityExcelRow[]) => {
  const results = {
    created: 0,
    updated: 0,
    errors: [] as string[],
  };

  for (const p of products) {
    try {
      // 1️⃣ έλεγχος αν υπάρχει προϊόν
      const existing = await commodityDAO.findCommodityByStripePriceId(
        p.stripePriceId
      );

      if (!existing) {
        // 2️⃣ CREATE
        await commodityDAO.createCommodity(p);
        results.created++;
      } else {
        // 3️⃣ UPDATE
        await commodityDAO.updateCommodityByStripePriceId(p.stripePriceId, p);
        results.updated++;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      results.errors.push(`Error for ${p.name}: ${message}`);
    }
  }

  return results;
};
```

- αυτή με την σειρά της φωνάζει τις αλλαγές που προσθέσαμε στο dao
- backend\src\stripe\daos\commodity.dao.ts

```ts
const findCommodityByStripePriceId = async (
  stripePriceId: string
): Promise<CommodityType | null> => {
  return await Commodity.findOne({ stripePriceId });
};

// προστέθηκε όταν βάλαμε την λειτουργία να κανει update με excel. το κάνει ελέγχοντας ποια εμπορεύματα έχουν stripe id και ποια όχι, οπότε δημιουργεί όσα δεν έχουν το stripe id που έρχετε απο το excel και κάνει update τα άλλα. για αυτό χρειαζόμασταν ένα dao που να κάνει update με βάση το stripeId
const updateCommodityByStripePriceId = async (
  stripePriceId: string,
  updateData: Partial<CommodityType>
): Promise<CommodityType | null> => {
  try {
    const updated = await Commodity.findOneAndUpdate(
      { stripePriceId },
      updateData,
      { new: true, runValidators: true }
    );

    return updated;
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'ValidationError') {
      throw new ValidationError(err.message);
    }
    throw new DatabaseError('Unexpected error updating commodity');
  }
};
```

### 8. if no zip remove strings from image field

αν χρειάζετε zip αλλα παρόλα αυτά δεν ανέβηκε ή δεν το βρίσκει θα πρέπει να αφαιρέσουμε τα string απο το images field

```ts
// 7️⃣ ZIP *είναι* απαραίτητο → αλλά μπορεί να λείπει
if (zipNeeded && !zipFileId) {
  warnings.push(
    'ZIP file missing but Excel contained filenames → importing WITHOUT images'
  );

  // Remove filenames as they cannot be processed
  // κάνει ένα map και ελέγχει ένα ένα τα προιόντα αν έχουν result filenames και αν ναι κάνουν το πεδίο images κενό [] αλλιώς το αφήνουν
  products = products.map((product, index) => {
    const result = analysisResults[index];
    return result.type === 'filenames' ? { ...product, images: [] } : product;
  });

  const saveResult = await addProductsFromExcel(products);
  return res.status(201).json({
    status: true,
    message: 'Products imported BUT without images (ZIP missing)',
    warnings,
    data: saveResult,
  });
}
```

### 9. download zip - controller

```ts
const zipBuffer = await downloadZipFromAppwrite(zipFileId);
```

- downloadZipFromAppwrite είναι ακριβώς ιδια με το downloadExcelFromAppwrite

### 10. unzip - controller

```ts
const zipImages = await unzipImages(zipBuffer);
```

- η unzipImages παίρνει buffer και επιστρέφει obj με key-το όνομα του αρχείου και value-το buffer της εικόνας

```ts
export const unzipImages = async (
  zipBuffer: Buffer
): Promise<Record<string, Buffer>> => {
  const images: Record<string, Buffer> = {};

  // Ανοίγουμε το ZIP και διαβάζουμε όλα τα entries
  // τώρα το directory έχει ένα array τύπου [{path: "keri1.jpg", type: "File", compressedSize: 12345, uncompressedSize: 33011, buffer: [Function: buffer], stream: [Function: stream],...},{},{}]
  const directory = await unzipper.Open.buffer(zipBuffer);

  for (const fileEntry of directory.files) {
    // το path του κάθε αρχείου μέσα στο zip, ουσιαστιά το filename του
    const filename = fileEntry.path;
    // console.log('→ Found ZIP entry:', filename);

    // Αγνοούμε directories
    if (fileEntry.type !== 'File') {
      continue;
    }

    // Επιτρέπουμε μόνο εικόνες
    const fileExtension = path.extname(filename).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fileExtension)) {
      continue;
    }

    // Παίρνουμε το binary content
    const content = await fileEntry.buffer();

    // Αποθηκεύουμε σε { {filename: buffer},{},{} }
    images[filename] = content;
  }

  return images;
};
```

### 11. Επεξεργασία μόνο των προϊόντων με filenames, if url handled in 7 - controller

```ts
const processedProducts = await processImagesForProducts(products, zipImages);

// Save to DB
const saveResult = await addProductsFromExcel(processedProducts);

return res.status(201).json({
  status: true,
  message: 'Products imported successfully (with ZIP images)',
  warnings,
  data: saveResult,
});
```

- η processImagesForProducts
  Παίρνει products[] + zipImages{ filename: buffer }
  ανεβάζει τις εικόνες στο Appwrite και επιστρέφει τελικό productsWithUrls[]

```ts
// input: array με products & obj βιβλιοθήκη με ονομα εικόνας και buffer εικόνας
// output: updated array products με url αντί για ονοματα αρχείων
export const processImagesForProducts = async (
  products: CommodityExcelRow[],
  zipImages: Record<string, Buffer>
): Promise<CommodityExcelRow[]> => {
  // αρχικοποιηση ενως temporary array που θα βάλουμε ένα ένα τα επεξεργασμένα προιόντα μας (με url αντι fiilename)
  const processedProducts: CommodityExcelRow[] = [];

  for (const product of products) {
    // αρχικοποίηση του πεδίου που θα μπούν τα urls
    const finalImageUrls: string[] = [];

    // product.images = ["keri1.jpg", "keri2.jpg"]
    for (const imageName of product.images) {
      // 1️⃣ Αν είναι URL → το κρατάμε όπως είναι
      if (/^https?:\/\//i.test(imageName)) {
        finalImageUrls.push(imageName);
        continue;
      }

      // 2️⃣ Αλλιώς → είναι filename → το ψάχνουμε στο ZIP
      const buffer = zipImages[imageName];

      if (!buffer) {
        console.warn(`⚠️ Image '${imageName}' not found in ZIP`);
        continue; // Skip this image (do not crash)
      }

      // Upload to Appwrite
      try {
        // χρησιμοποιούμε το util που φτιάξαμε στο 3d βήμα
        const url = await uploadImageBufferToAppwrite(buffer, imageName);
        finalImageUrls.push(url);
      } catch (err) {
        console.error(`❌ Failed to upload image '${imageName}':`, err);
      }
    }

    // Return the product with Appwrite URLs instead of file names
    // κρατάμε όλο το Product όπως είναι εκτός απα το πεδίο images
    processedProducts.push({
      ...product,
      images: finalImageUrls,
    });
  }

  return processedProducts;
};
```

### test

added manualy to appwrite and took fileId for excel zip → 3 products → 1 with one image filename → 1 with 2 images filename → 1 with 2 urls

```bash
curl -X POST http://localhost:3001/api/excel/import   -H "Content-Type: application/json"   -d '{
    "fileId": "6933369a001a8415996c",
    "originalName": "products_test_img.xlsx",
    "zipFileId": "6932d6600005f3352195"
  }'
```

got
`{"status":true,"message":"Products imported successfully (with ZIP images)","warnings":[],"data":{"created":3,"updated":0,"errors":[]}}`

# gia argotera

💠 Phase 2 — Export προϊόντων σε Excel
Ώστε ο admin να κατεβάζει όλη τη λίστα προϊόντων σε Excel
(με URLs ή filenames).

💠 Phase 3 — Full Sync Mode
Πολύ σημαντικό:
Αν υπάρχουν προϊόντα στη DB που δεν υπάρχουν στο Excel → να διαγράφονται ή να γίνονται inactive.
(Επιλογή με flag.)
Παράδειγμα:
Excel έχει: A, B, C
DB έχει: A, B, C, D
→ Το D να γίνει inactive ή delete.
Αυτό το λένε synchronization mode.

💠 Phase 4 — Validation layer
π.χ.
Empty name → reject
Price <= 0 → reject
Stripe ID missing → reject
Category invalid → warning

1️⃣ Export προϊόντων σε Excel
2️⃣ Full sync mode (create/update/delete)
4️⃣ Frontend uploader (2 αρχεία: Excel + ZIP)
5️⃣ Θες να προσθέσουμε image resizing (small/medium/large) αυτόματα;
