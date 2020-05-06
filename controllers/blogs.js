const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const blogsRouter = require('express').Router()

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog
    .find({})
    .populate('user', {
      username: 1,
      name: 1,
      id: 1
    })
  res.json(blogs)
})

blogsRouter.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  res.json(blog)
})

blogsRouter.post('/', async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET)
  if (!req.token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: req.body.title,
    author: req.body.author,
    url: req.body.url,
    likes: req.body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  res.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET)
  const blog = await Blog.findById(req.params.id)
  if (!blog)
    res.status(404).end()
  if (!req.token || !decodedToken.id || !blog.user || decodedToken.id.toString() !== blog.user.toString())
    res.status(401).end()
  await Blog.findByIdAndDelete(req.params.id)
  res.status(204).end()

})

blogsRouter.put('/:id', async (req, res) => {
  const blog = {
    title: req.body.title,
    author: req.body.author,
    url: req.body.url,
    likes: req.body.likes,
  }

  const response = await Blog
    .findByIdAndUpdate(req.params.id, blog, { new:true, runValidators:true, context: 'query' })

  res.json(response)
})

module.exports = blogsRouter