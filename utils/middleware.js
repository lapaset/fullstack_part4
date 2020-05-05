const logger = require('./logger')

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler =(error, req, res, next) => {
  logger.error(error.message)
  if (error.name === 'ValidationError')
    return res.status(400).json({ error: error.message })
  else if (error.name === 'JsonWebTokenError')
    return res.status(401).json({ error: 'invalid token' })
  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler
}