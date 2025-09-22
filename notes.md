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
- chat gpt profanity comment test. if not pass wait for admin aproval ✅
- cosline similarity commodity search

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
- GAnalytics now tracks commodity impretions and commodity pages ✅, learn dashboard
- chat gpt criteria optimiser ✅
- αγαπημένα προιόντα ❤️
- τα έξοδα αποστολής να προστήθεντε (ως invisible commodities)

- ## e2e test

# security  

### ⚠️ Still important to consider
- 🚨 Replace localStorage with httpOnly cookies → biggest gain.
- 🚨 Avoid tokens in query params on OAuth success → fix Google/GitHub flow.

### 🔐 Frontend – already done

- DOMPurify for blog/Editor.js rendering
- React auto-escaping for plain text (comments, commodity descriptions)
- Frontend validators (password, email, postal, phone) aligned with backend
- No raw dangerouslySetInnerHTML except sanitized renderer
- Google Maps iframe hardcoded, not user-provided
- Role-based protected routes (PrivateRoute, AdminPrivateRoute)

### ⚙️ Backend – already done

- Winston logger
- CORS with allow-list
- Helmet with CSP
- Zod input validation
- Role-based access control
- Healthcheck API endpoint
- Rate limiter (global + login brute-force)
- Automated tests in GitHub Actions
- DAO pattern for DB access
- Environment variables for secrets
- Upload size restriction
- JWT authentication, passwords hashed (never stored plain)
- npm audit for dependency vulnerabilities

# notes
### Render setup
Root Directory: leave blank (since backend + frontend are in root).
Build Command:
`cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build`
Start Command:
`cd backend && npm start`

test success stripe
`http://localhost:5173/checkout-success?session_id=cs_live_a1PBF9KvFU5WOiYAIA6FyI3zpQfRDR54C1VO7OJTBax1YfytAyK2bygMFj`

✅ Backend Security (Node + Express + Mongo)

 Auth & Tokens → JWT secret in env, verify middleware, role-based access ✅
 Password security → bcrypt, strong policy with Zod ✅
 Rate limiting → express-rate-limit global ✅
 Input validation → Zod everywhere ✅
 NoSQL injection → Mongoose schemas ✅
 CORS & Headers → cors with allow-list, helmet ✅
 Error handling → no centralized error handler yet (stack traces may leak) ⚠️
 Payments → Stripe Checkout + webhook ✅ (server verifies, prices trusted from dashboard)
 Database hardening → not shown (least privilege, TLS, backups) ⚠️

✅ Frontend Security (React)

 Auth → still storing tokens in localStorage ⚠️ (httpOnly cookies recommended)
 Forms & Inputs → DOMPurify on blog posts ✅; comments plain text ✅
 Sensitive data → API keys hidden, only env URLs exposed ✅
 Dependencies → npm audit✅

✅ Infra & Deployment

 Environment variables → using .env, not committed ✅
 HTTPS → not shown; must be enforced in production ⚠️
 Server hardening → not shown (run as non-root, PM2/Docker) ⚠️
 CI/CD → GitHub Actions in use, secrets stored in repo settings ✅
 Logging & Monitoring → Winston partially

✅ Legal / Compliance

 GDPR → partial (account deletion exists, but no cookie consent / privacy pages) ⚠️
 Payments → Stripe only, no card storage ✅
 Privacy Policy / Terms → not implemented yet ⚠️

⚡ Biggest remaining gaps (high severity & easy-ish to fix):

Tokens in localStorage → move to httpOnly cookies.
Error handling → centralize error middleware, hide stack traces.
CSP → tighten imgSrc (currently allows any https image).
HTTPS enforcement.
Privacy Policy / Terms pages.


