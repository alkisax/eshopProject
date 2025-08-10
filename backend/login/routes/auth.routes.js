const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

router.post('/', authController.login)
router.get('/google/callback', authController.googleLogin)

module.exports = router


// https://accounts.google.com/o/oauth2/auth?client_id={apo_to_google}&redirect_uri={apo_to_google}&response_type={apo_to_auth.service}&scope=email%20profile&access_type=offline
// https://accounts.google.com/o/oauth2/auth?client_id=37391548646-a2tj5o8cnvula4l29p8lodkmvu44sirh.apps.googleusercontent.com&redirect_uri=http://localhost:3000/api/login/google/callback&response_type=code&scope=email%20profile&access_type=offline
//After the user authorizes the Google login, Google will redirect to your http://localhost:3000/api/auth/google/callback with the authorization code as a query parameter (code). Make sure your frontend catches this and sends the code to the backend for authentication.

// https://accounts.google.com/o/oauth2/auth?client_id=37391548646-a2tj5o8cnvula4l29p8lodkmvu44sirh.apps.googleusercontent.com&redirect_uri=https://loginapp-tjlf.onrender.com/api/login/google/callback&response_type=code&scope=email%20profile&access_type=offline
