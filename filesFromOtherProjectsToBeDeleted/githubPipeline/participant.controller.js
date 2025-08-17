const bcrypt = require("bcrypt")
const logger = require('../utils/logger')
const Participant = require('../models/participant.models')
const participantDao = require('../daos/participant.dao')

exports.findAll = async (req,res) => {
  try {
    // add later when auth
    if (!req.headers.authorization) {
      return res.status(401).json({ status: false, error: 'No token provided' });
    }

    const participants = await participantDao.findAllParticipants()
    logger.info("Fetched all participants");
    res.status(200).json({
      status: true,
      data: participants
    })

  } catch (error) {
    logger.error(`findAll error: ${error.message}`)
    console.error(error)
    res.status(500).json({
      status: false,
      error: 'find all paricipants error'
    })
  }
}

exports.create = async (req,res) => {
  let data = req.body

  const name = data.name
  const surname = data.surname
  const email = data.email
  const transactions = data.transactions

  try {

    const newParticipant = await participantDao.createParticipant({
      name,
      surname,
      email,
      transactions
    });

    logger.info(`Created new participant: ${email}`);
    res.status(201).json(newParticipant)
  } catch(error) {
    logger.error(`Error creating participant: ${error.message}`);
    res.status(400).json({error: error.message})
  }
}

exports.deleteById = async (req, res) => {
  const participantId = req.params.id
  if (!participantId){
    logger.warn("Delete attempt without ID");
    return res.status(400).json({
      status: false,
      error: 'participant ID is required OR not found'
    })
  }
  
  try {
    const deleteParticipant = await participantDao.deleteParticipantById(participantId) 

    if (!deleteParticipant){
      logger.warn(`Delete failed: participant ${participantId} not found`);
      return res.status(404).json({
        status: false,
        error: 'Error deleting participant: not found'
      })
    } else {
      logger.info(`Deleted participant ${deleteParticipant.username}`);
      res.status(200).json({
        status: true,
        message: `participant ${deleteParticipant.username} deleted successfully`,
      })
    }
  } catch (error) {
    logger.error(`Delete error: ${error.message}`);
    res.status(500).json({
      status: false,
      error: error.message
    })
  }
}