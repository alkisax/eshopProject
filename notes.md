# Context for my app (quick catch-up)
- [ ] UserAuthContext.tsx
- [ ] Login.tsx (main login page/combiner)
- [ ] LoginGoogle.tsx / LoginAppwrite.tsx / LoginBackend.tsx / GithubLogin.tsx
- [ ] types.ts (IUser + JWT payloads)
- [ ] Backend: auth.controller.ts
- [ ] Backend: auth.service.ts
- [ ] Backend: user.model.ts


Frontend

src/context/UserAuthContext.tsx → where you store/update the logged-in user.

src/App.tsx (or your router entry) → to see how login/logout routes are wired.

src/components/Login.tsx (or equivalent) → your login page that calls Google/Appwrite/backend.

src/components/Navbar.tsx (or wherever you display user info / logout).

Backend

backend/src/models/User.ts (or schema file) → to see all fields (id, username, hasPassword, lastProvider, etc.).

backend/src/controllers/auth.controller.ts (or main login/signup controller).

backend/src/services/auth.service.ts → if you’ve separated the logic from controller.

backend/src/routes/auth.routes.ts → to see what endpoints frontend calls.