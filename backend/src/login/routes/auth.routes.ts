import express from 'express'
const router = express.Router()
import { authController } from '../controllers/auth.controller'
import { authAppwriteController } from '../controllers/auth.appwrite.controller'

//>     "username": "alkisax",
//>     "password": "AdminPass1!"
router.post('/', authController.login)

router.get('/google/url/login', authController.getGoogleOAuthUrlLogin)
router.get('/google/url/signup', authController.getGoogleOAuthUrlSignup)
router.get('/google/callback', authController.githubCallback) // creates and res jwt with user info

router.get('/google/login', authController.googleLogin)
router.get('/google/signup', authController.googleSignup)

router.post('/appwrite/sync', authAppwriteController.syncUser)

router.get('/github/login', authController.githubLogin)
router.get('/github/callback', authController.githubCallback);

export default router;


// https://accounts.google.com/o/oauth2/auth?client_id={apo_to_google}&redirect_uri={apo_to_google}&response_type={apo_to_auth.service}&scope=email%20profile&access_type=offline

// https://accounts.google.com/o/oauth2/auth?client_id=37391548646-a2tj5o8cnvula4l29p8lodkmvu44sirh.apps.googleusercontent.com&redirect_uri=http://localhost:3001/api/login/google/callback&response_type=code&scope=email%20profile&access_type=offline
//After the user authorizes the Google login, Google will redirect to your http://localhost:3000/api/auth/google/callback with the authorization code as a query parameter (code). Make sure your frontend catches this and sends the code to the backend for authentication.

// https://accounts.google.com/o/oauth2/auth?client_id=37391548646-a2tj5o8cnvula4l29p8lodkmvu44sirh.apps.googleusercontent.com&redirect_uri=https://loginapp-tjlf.onrender.com/api/login/google/callback&response_type=code&scope=email%20profile&access_type=offline

/* link on working with eshoProject
https://accounts.google.com/o/oauth2/auth?client_id=37391548646-d7ahgip4t126647gpg4vmfo94hfe19k4.apps.googleusercontent.com&redirect_uri=http://localhost:3001/health&response_type=code&scope=email%20profile&access_type=offline
*/