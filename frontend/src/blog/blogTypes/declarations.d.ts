/* 
  Αυτό το αρχείο δημιουργήθηκε για να «ξεγελάσουμε» το TypeScript.

  Πρόβλημα:
  Τα περισσότερα plugins του Editor.js (π.χ. @editorjs/marker, @editorjs/attaches, 
  editorjs-paragraph-with-alignment) δεν παρέχουν δικά τους type declarations (.d.ts).
  Όταν τα κάνουμε import στο project, το TypeScript πετάει error 7016 
  ("Could not find a declaration file for module ...").

  Λύση:
  Δηλώνουμε χειροκίνητα αυτά τα modules εδώ με το `declare module '...'`.
  Έτσι το TypeScript τα αναγνωρίζει σαν έγκυρα imports (με type `any` από default) 
  και σταματάνε τα errors κατά το build.

  χρησιμοποιήτε στο useInitEditor
*/

declare module '@editorjs/marker';
declare module '@editorjs/attaches';
declare module '@editorjs/embed';
declare module 'editorjs-text-alignment-blocktune';
declare module 'editorjs-paragraph-with-alignment';