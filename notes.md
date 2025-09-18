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
- fix email ✅
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
- bugs in search categories ✅
- chat gpt criteria optimiser
- editor js is not finished in blog
- τα έξοδα αποστολής να προστήθεντε

# security

⚠️ Still important to consider
- JWT/session security
Biggest remaining risk: storing JWT in localStorage.
Short-term: sanitize user-generated content (you allow free-text comments) with something like dompurify on the frontend.
Medium-term: switch to httpOnly secure cookies → removes XSS token theft vector.

- Comment / Editor.js content
You allow Schema.Types.Mixed and editorJsDataSchema.
Make sure you sanitize HTML when rendering (Editor.js content might include dangerous attributes if someone crafts JSON manually).
Recommend using a sanitizer (DOMPurify, sanitize-html) before rendering on the frontend.

so now we have:
- basic winston logger 
- cors 
- helmet 
- zod input validation 
- roles 
- helth api 
- rate limiter for ddos and login brute 
- lot of tests that are auto run in github actions 
- use dao for db communication 
- use env for all sensitive 
- size restriction in uploads 
- jwt and dont store not hashed, or reviealed 
- npm audit

# notes
### Render setup
Root Directory: leave blank (since backend + frontend are in root).
Build Command:
`cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build`
Start Command:
`cd backend && npm start`

test success stripe
`http://localhost:5173/checkout-success?session_id=cs_live_a1PBF9KvFU5WOiYAIA6FyI3zpQfRDR54C1VO7OJTBax1YfytAyK2bygMFj`


Here’s a ToDo-style checklist for you:

✅ Backend Security (Node + Express + Mongo)

 Auth & Tokens

Use jsonwebtoken with strong secrets (process.env.JWT_SECRET).
Short expiry access tokens + long expiry refresh tokens.
Always verify tokens with middleware.verifyToken.
Use role-based access (you already do for ADMIN routes ✅).

 Password security

Store with bcrypt (min 10–12 rounds).
Never log passwords.
Enforce strong password policy (length + complexity).

 Rate limiting

Add rate limiting middleware (e.g. express-rate-limit) on login/signup & sensitive routes.

 Input validation

Validate request bodies with zod, joi or express-validator.
Reject invalid IDs (Mongo ObjectId).
Prevent oversized payloads (express.json({ limit: "1mb" })).

 NoSQL injection

Don’t pass untrusted input directly into Mongo queries ({ $where: ... } or string concatenation).
Use mongoose with schema validation (you already do ✅).

 CORS & Headers

Restrict allowed origins (cors).
Set security headers (helmet).

 Error handling

Centralized error handler → never leak stack traces to clients.
Log errors securely (e.g. Winston), but scrub sensitive info.

 Payments

Only use Stripe Checkout/PaymentIntent IDs from Stripe dashboard.
Never trust price or amount from frontend.
Verify Stripe webhooks with secret signature.

 AI moderation

Don’t trust frontend only — moderation logic should be server-side or double-checked.
Sanitize GPT responses if you use them in UI.

 Database

Use separate Mongo user with least privileges.
Enable auth & TLS in production DB.
Backups & restore process.

✅ Frontend Security (React)

 Auth

Don’t store tokens in localStorage if possible → prefer httpOnly cookies (XSS safer).
If using localStorage, sanitize all inputs to reduce XSS risk.

 Forms & Inputs

Escape user-generated content before rendering.
Strip HTML tags from comments or use a sanitization lib (like dompurify) if rich text.

 Sensitive data

Never expose API keys in frontend.
Use REACT_APP_API_URL from .env but backend must keep secrets.

 Dependencies

Audit with npm audit and update often.
Avoid abandoned npm packages.

 AI toggle

Make sure the “AI moderation enabled” toggle is ADMIN-only.

✅ Infra & Deployment

 Environment variables

Use .env with dotenv, never commit to GitHub.
Different .env for dev/test/prod.

 HTTPS

Always use TLS (Let’s Encrypt for free).
Redirect HTTP → HTTPS.

 Server hardening

Don’t run Node as root.
Use process managers (PM2, Docker).

 CI/CD

Secrets in GitHub Actions must use GitHub Secrets.
Run tests before deploy.

 Logging & Monitoring

Add Winston logs for key events (login, payment, admin actions).
Set up alerts (e.g. too many failed logins).

✅ Legal / Compliance

 GDPR

Inform users about stored data (comments, profiles, orders).
Allow account deletion.
Cookie consent if tracking analytics.

 Payments

Don’t store card data yourself (Stripe only).
Keep Stripe webhook secret private.

 Privacy Policy / Terms

Basic pages explaining what you store, how you use it.

👉 If you tick these off one by one, you’ll be 95% secure for a small eShop.
The biggest gaps I see in your current stack are:

no rate limiting,
tokens in localStorage,
input sanitization missing for comments,
CORS & Helmet setup not shown,
Stripe payment verification needs to ensure amounts are server-side trusted.


