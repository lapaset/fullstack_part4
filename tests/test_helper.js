const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'muumin blogi',
    author: 'muumi',
    url: 'muuminblogi.fi',
    likes: 42,
  },
  {
    title: 'mymmelin blogi',
    author: 'mymmeli',
    url: 'mymmelinblogi.fi',
    likes: 7300,
  },
  {
    title: 'pirkon blogi',
    author: 'muumi',
    url: 'pirkkorulaa.fi',
    likes: 420,
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(b => b.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb
}