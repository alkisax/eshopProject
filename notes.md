# backend
- delete only one comment ✅
- bind participant to user ✅
- transfer email message to .env ✅
- cart total price ❌ will not do. as front can do i by it self
- swagger fro participant find by id/email ✅
- remove middleware from cart. guests need cart ✅
- /cart/clean-junk /participant/clear-junk (longer than lastupdated a week)
- stripe paypal and gpay (said its on stripe dashboard) ✅
- stripe webhooks
- comment crud
- comment and store multer and appwrrite image bucket
- chat gpt profanity comment test. if not pass wait for admin aproval or delete after 5 days

# frontend
- minimal shop ✅
- minimal cart page ✅ 
- checkout ✅
- right sidebar in store if cart with edit quantities
- left sidebar in store with criteria and search
- chat gpt criteria optimiser
- προηγούμενες αγορες ✅

Validation

Double-check you don’t allow accessing /api/transaction/participant/:id without ownership. Right now, you use verifyToken but not “ownership check” — a user could try to request another’s participantId.

Easiest: check req.user.email === participant.email in controller.

τι γινετε με το succes αν δεν είναι user. θα πρέπει να το παρκάμψουμε αλλα να δείχνει τελευταια αγορα μέσο φροντ εντ