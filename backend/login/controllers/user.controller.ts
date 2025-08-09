const bcrypt = require('bcrypt')
const User = require('../models/users.models')
const authService = require('../services/auth.service')
const logger = require('../logger/logger')
const userDAO = require('../daos/user.dao')
const { toUserDTO } = require('../dtos/user.dto')

exports.findAll = async (req,res) => {
  try {

    if (!req.headers.authorization) {
      return res.status(401).json({ status: false, error: 'No token provided' });
    }

    const users = await userDAO.findAllUsers();
    res.status(200).json({ status: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }

exports.create = async (req,res) => {
  let data = req.body

  const username = req.body.username
  const name = req.body.name
  const password = req.body.password
  const email = req.body.email
  const roles = req.body.roles

  const SaltOrRounds = 10
  const hashedPassword = await bcrypt.hash(password, SaltOrRounds)

  try {

    const newUser = await userDAO.createUser({
      username,
      name,
      email,
      roles,
      hashedPassword
    });

    logger.info(`Created new user: ${username}`);
    res.status(201).json(newUser)
  } catch(error) {
    logger.error(`Error creating user: ${error.message}`);
    res.status(400).json({error: error.message})
  }
}

exports.deleteById = async (req, res) => {
  const userId = req.params.id
  if (!userId){
    return res.status(400).json({
      status: false,
      error: 'User ID is required OR not found'
    })
  }
  try {
    const deleteUser = await userDAO.deleteUserById(userId) // to be added to user.dao.js
    if (!deleteUser){
      return res.status(404).json({
        status: false,
        error: 'Error deleting user: not found'
      })
    } else {
      res.status(200).json({
        status: true,
        message: `User ${deleteUser.username} deleted successfully`,
      })
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message
    })
  }
}