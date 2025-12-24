// frontend\src\utils\resizeImage.ts

// resize εικόνας αν ξεπερνά τα 2MB
// frontend/src/utils/resizeImage.ts

export interface ResizeResult {
  file: File;
  resized: boolean;
  originalSize: number;
  newSize: number;
}

export const resizeImageIfNeeded = async (
  file: File,
  maxSizeMB = 2
): Promise<ResizeResult> => {
  // file.type = MIME type του αρχείου
  // 1 MB = 1024 KB, 1 KB = 1024 bytes
  if (!file.type.startsWith("image/") || file.size <= maxSizeMB * 1024 * 1024) {
    return {
      file,
      resized: false,
      originalSize: file.size,
      newSize: file.size,
    };
  }

  // βασικό pattern για async κώδικα που βασίζεται σε callbacks (όπως FileReader, Image.onload, canvas.toBlob)
  // resolve(result) → δηλώνει «τελείωσε επιτυχώς»
  // reject(error) → δηλώνει «κάτι πήγε στραβά»
  return new Promise((resolve, reject) => {
    // Δημιουργούμε ένα Image object (σαν <img>, αλλά στη μνήμη)
    // Θα το χρησιμοποιήσουμε για να:
    // - φορτώσουμε την εικόνα
    // - μάθουμε το πραγματικό width / height
    const img = new Image();
    // Δημιουργούμε FileReader για να διαβάσουμε το File που έδωσε ο χρήστης
    const reader = new FileReader();

    // Όταν ο FileReader τελειώσει να διαβάζει το αρχείο...
    reader.onload = () => {
      // Το reader.result είναι base64 string (data:image/jpeg;base64,...) Το βάζουμε στο img.src για να ξεκινήσει η φόρτωση της εικόνας στη μνήμη του browser
      img.src = reader.result as string;
    };

    // Αν αποτύχει το διάβασμα του αρχείου (IO error, corrupted file, permissions) τότε: απορρίπτουμε το Promise και το await θα πετάξει error
    reader.onerror = reject;

    // Όταν η εικόνα έχει φορτωθεί ΠΛΗΡΩΣ στη μνήμη...
    img.onload = () => {
      // Δημιουργούμε ένα canvas (off-screen, δεν μπαίνει στο DOM) Το canvas είναι bitmap → δουλεύουμε απευθείας με pixels
      const canvas = document.createElement("canvas");
      // Παίρνουμε 2D drawing context (τα "πινέλα")
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      // Ορίζουμε το μέγιστο πλάτος / ύψος που επιτρέπουμε
      const MAX = 1600;
      // Παίρνουμε τις πραγματικές διαστάσεις της εικόνας
      let { width, height } = img;

      // Αν η εικόνα είναι μεγαλύτερη από το MAX,  υπολογίζουμε αναλογία ώστε να μικρύνει ΑΝΑΛΟΓΙΚΑ
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Ορίζουμε το canvas στις νέες διαστάσεις
      canvas.width = width;
      canvas.height = height;

      // Ζωγραφίζουμε την εικόνα στο canvas Αν οι διαστάσεις διαφέρουν → γίνεται resize
      ctx.drawImage(img, 0, 0, width, height);

      // Μετατρέπουμε το canvas σε Blob (binary αρχείο εικόνας)
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"));

          // Δημιουργούμε νέο File από το Blob. Αυτό είναι το resized αρχείο που θα ανέβει στο Appwrite
          const resizedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          resolve({
            file: resizedFile,
            resized: true,
            originalSize: file.size,
            newSize: resizedFile.size,
          });
        },
        "image/jpeg",
        0.75
      );
    };

    reader.readAsDataURL(file);
  });
};
