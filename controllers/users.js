const User = require('../models/user')
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()

usersRouter.get('/', async (req, res) => {
  const users = await User
    .find({})
    .populate('blogs', {
      url: 1,
      title: 1,
      author: 1,
      id: 1
    })
  res.json(users)
})

usersRouter.post('/', async (req, res) => {
  if (!req.body.password || req.body.password.length < 3)
    return res.status(400).json({ error: 'password too short'})

  const passwordHash = await bcrypt.hash(req.body.password, 10)

  const user = new User({
    username: req.body.username,
    name: req.body.name,
    passwordHash
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

usersRouter.delete('/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id)
  if (user)
    res.status(204).end()
  else
    res.status(404).end()
})

module.exports = usersRouter