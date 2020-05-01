const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const noteObjects = helper.initialBlogs
    .map(b => new Blog(b))
  const promiseArray = noteObjects.map(b => b.save())
  await Promise.all(promiseArray)
})

describe('http get', () => {
  test('returns blog posts in JSON format', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('returns the right amount of blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
})

test('blogs have identifier named id', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})

describe('http post', () => {
  test('adds a valid blog to the list', async () => {
    const newBlog = {
      title: 'uusi blogi',
      author: 'muumi',
      url: 'muuminblogi.fi',
      likes: 42,
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const notesAtEnd = await helper.blogsInDb()
    expect(notesAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  })

  test('blog likes default to 0', async () => {
    const newBlog = {
      title: 'nobody likes me. yet',
      author: 'future star',
      url: 'test.fi'
    }
    const result = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(result.body.likes).toEqual(0)
  })

  test('missing title status is 400 bad request and blog is not added', async () => {
    const newBlog = {
      author: 'future star',
      url: 'test.fi'
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const notesAtEnd = await helper.blogsInDb()
    expect(notesAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('missing url status is 400 bad request and blog is not added', async () => {
    const newBlog = {
      author: 'future star',
      title: 'testi'
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const notesAtEnd = await helper.blogsInDb()
    expect(notesAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('http delete', () => {
  test('succeeds with statuscode 204 with valid id', async () => {
    const blogs = await helper.blogsInDb()
    const blogToRemove = blogs[0]

    await api
      .delete(`/api/blogs/${blogToRemove.id}`)
      .expect(204)

    const blogsAfter = await helper.blogsInDb()
    expect(blogsAfter).toHaveLength(blogs.length - 1)

    const ids = blogsAfter.map(b => b.id)
    expect(ids).not.toContain(blogToRemove.id)
  })
})

describe('http put', () => {
  test('success with statuscode 200 with valid data updates bloglist', async () => {
    const blogs = await helper.blogsInDb()
    const blogToUpdate = blogs[0]

    const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogAfter = await api
      .get(`/api/blogs/${blogToUpdate.id}`)
      .expect(200)

    expect(blogAfter.body.likes).toEqual(blogToUpdate.likes + 1)
  })
})



afterAll(() => {
  mongoose.connection.close()
})