# backend
- delete only one comment ✅
- bind participant to user ✅
- transfer email message to .env ✅
- cart total price ❌ will not do. as front can do i by it self
- swagger fro participant find by id/email ✅
- remove middleware from cart. guests need cart
- /cart/clean-junk (longer than lastupdated a week)
- stripe webhooks
- comment crud
- comment and store multer and appwrrite image bucket
- chat gpt profanity comment test. if not pass wait for admin aproval or delete after 5 days

# frontend
const addToCart = () => { // export user from token // check if user is associated with a participant // check if participant exists if not create one // add participant to user // get participant id // chack if participant has cart if no create one // get commodity id // add commidity to cart } (no code answer) im confused creating this psuedocode we have a user and a participant user only logs in but user can be a participant in backend only in participant model is association with user do we have to fetch all participants this could be huge