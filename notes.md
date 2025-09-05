# backend
- **security issue:** if a user is logged in passes middleware. can access sensitive info of others? Θα πρέπει να φτιαχτούν διαφορετικά endpoints για τον guest που να κάνουν την ίδια δουλειά αλλα να μην έχουν verification middliware
- problems in github login
- delete only one comment ✅
- bind participant to user ✅
- transfer email message to .env ✅
- cart total price ❌ will not do. as front can do i by it self
- swagger fro participant find by id/email ✅
- remove middleware from cart. guests need cart ✅
- /cart/clean-junk /participant/clear-junk (longer than lastupdated a week)
- stripe paypal and gpay (said its on stripe dashboard) ✅
- multer upload ✅
- appwrite image bucket ✅
- clear junk endpoint (what happens to deleted commodity images?)
- new category schema with supercategory, and allow parent category with arr of categories as child. Also some categories to have an atribute of "tag"
- stripe webhooks
- comment crud
- chat gpt profanity comment test. if not pass wait for admin aproval or delete after 5 days
- participants must have shipping address end email / users must have shipping address

- create a security risks checklist

# frontend
- minimal shop ✅
- minimal cart page ✅ 
- checkout ✅
- right sidebar in store if cart with edit quantities ✅
- left sidebar in store with criteria and search ✅
- chat gpt criteria optimiser
- προηγούμενες αγορες ✅
- crud εμπορευματων και transaction - admin pannel ✅
- add create commodity to admin panel → commodity tab ✅
- add image to commodity admin panel → commodity tab → edit ✅
- πρέπει να δώσει υποχρεωτικα Mail ο guest για να του έρθει το confirmation
- πόσα έχουν πουληθεί στο admin pannel commodities



τι γινετε με το succes αν δεν είναι user. θα πρέπει να το παρκάμψουμε αλλα να δείχνει τελευταια αγορα μέσο φροντ εντ