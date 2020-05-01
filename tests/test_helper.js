const Blog = require('../models/blog')

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

module.exports = {
  initialBlogs,
  blogsInDb
}