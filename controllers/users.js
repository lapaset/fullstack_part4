const User = require('../models/user')
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()

usersRouter.get('/', async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

usersRouter.post('/', async (req, res) => {
  if (!req.body.password || req.body.password.length < 3)
    return res.status(400).json({ error: 'password too short'})

  const passwordHash = await bcrypt.hash(req.body.password, 10)

  const user = new User({
    username: req.body.username,
    name: req.body.name,
    passwordHash: passwordHash
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

module.exports = usersRouter