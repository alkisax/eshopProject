const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller.js')
const { verifyToken, checkRole } = require('../middlewares/verification.middleware');

router.get ('/', verifyToken, checkRole('admin'), userController.findAll)
router.post('/', userController.create)
router.delete('/:id', verifyToken, checkRole('admin'), userController.deleteById)

module.exports = router