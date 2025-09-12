# backend
- **security issue:** if a user is logged in passes middleware. can access sensitive info of others? Θα πρέπει να φτιαχτούν διαφορετικά endpoints για τον guest που να κάνουν την ίδια δουλειά αλλα να μην έχουν verification middliware
- problems in github login
- delete only one comment ✅
- bind participant to user ✅
- transfer email message to .env ✅
- cart total price ❌ will not do. as front can do i by it self
- swagger fro participant find by id/email ✅
- remove middleware from cart. guests need cart ✅
- /cart/clean-junk ✅ clear old transactions✅(5 years) /participant/clear ✅(longer than lastupdated a week)
- stripe paypal and gpay (said its on stripe dashboard) ✅
- stripe webhooks ✅
- multer upload ✅
- appwrite image bucket ✅
- clear junk endpoint✅
- add logger to save to file after stripe success ✅
- participants must have shipping address end email / users must have shipping address ✅ implemented by adding shipping info to transaction
- (what happens to deleted commodity images?)
- webhook swagger and tests ✅
- new category schema with supercategory, and allow parent category with arr of categories as child. Also some categories to have an atribute of "tag" ✅
- comment crud ✅
- fix email
- chat gpt profanity comment test. if not pass wait for admin aproval or delete after 5 days

- create a security risks checklist

# frontend
- minimal shop ✅
- minimal cart page ✅ 
- checkout ✅
- right sidebar in store if cart with edit quantities ✅
- left sidebar in store with criteria and search ✅
- προηγούμενες αγορες ✅
- crud εμπορευματων και transaction - admin pannel ✅
- add create commodity to admin panel → commodity tab ✅
- add image to commodity admin panel → commodity tab → edit ✅
- πρέπει να δώσει υποχρεωτικα Mail ο guest για να του έρθει το confirmation ✅
- πόσα έχουν πουληθεί στο admin pannel commodities ✅
- notes in shipping unresponcive ✅
- if no commodity image show sth ✅
- local upload ❌
- missmacth with front comerce type editorJsContent❓❓❓
- chat gpt criteria optimiser



# notes
### Render setup
Root Directory: leave blank (since backend + frontend are in root).
Build Command:
`cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build`
Start Command:
`cd backend && npm start`

test success stripe
`http://localhost:5173/checkout-success?session_id=cs_live_a1PBF9KvFU5WOiYAIA6FyI3zpQfRDR54C1VO7OJTBax1YfytAyK2bygMFj`


https://mykarma.gr/cdn/shop/products/image_4016df63-3062-49c5-8468-9477e95741ed.png, https://mykarma.gr/cdn/shop/products/image_5df831d4-0f9f-446f-a3da-cfd7e65effba.png, https://mykarma.gr/cdn/shop/products/image_b47e045f-672b-4c0d-bc04-15e4cb781fec.png