# backend
- **security issue:** if a user is logged in passes middleware. can access sensitive info of others? Θα πρέπει να φτιαχτούν διαφορετικά endpoints για τον guest που να κάνουν την ίδια δουλειά αλλα να μην έχουν verification middliware
- delete only one comment ✅
- bind participant to user ✅
- transfer email message to .env ✅
- cart total price ❌ will not do. as front can do i by it self
- swagger fro participant find by id/email ✅
- remove middleware from cart. guests need cart ✅
- /cart/clean-junk /participant/clear-junk (longer than lastupdated a week)
- stripe paypal and gpay (said its on stripe dashboard) ✅
- new category schema with supercategory, and allow parent category with arr of categories as child. Also some categories to have an atribute of "tag"
- stripe webhooks
- comment crud
- comment and store multer and appwrrite image bucket
- chat gpt profanity comment test. if not pass wait for admin aproval or delete after 5 days

# frontend
- minimal shop ✅
- minimal cart page ✅ 
- checkout ✅
- right sidebar in store if cart with edit quantities ✅
- left sidebar in store with criteria and search ✅
- chat gpt criteria optimiser
- προηγούμενες αγορες ✅
- profile page -> previous pages /change profile sidebar
- crud εμπορευματων και transaction - admin pannel
- πρέπει να δώσει υποχρεωτικα Mail ο guest για να του έρθει το confirmation



τι γινετε με το succes αν δεν είναι user. θα πρέπει να το παρκάμψουμε αλλα να δείχνει τελευταια αγορα μέσο φροντ εντ