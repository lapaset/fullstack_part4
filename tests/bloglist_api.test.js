const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

describe('blogs', () => {
  let token

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('kille', 10)
    const user = new User({
      username: 'kalle',
      passwordHash: passwordHash,
    })
    await user.save()

    const loginUser = {
      username: 'kalle',
      password: 'kille'
    }

    const login = await api
      .post('/api/login')
      .send(loginUser)

    token = login.body.token

    const noteObjects = helper.initialBlogs
      .map(b => new Blog({ ...b, user: user.id }))
    const promiseArray = noteObjects.map(b => b.save())
    await Promise.all(promiseArray)
  })

  describe('http get', () => {
    test('returns blog posts in JSON format', async () => {
      const result = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      console.log(result.body)
      console.log('token', token)
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
        .set({ Authorization: `bearer ${token}` })
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
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
        .set({ Authorization: `bearer ${token}` })
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
        .set({ Authorization: `bearer ${token}` })
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })

    test('missing url status is 400 bad request and blog is not added', async () => {
      const newBlog = {
        author: 'future star',
        title: 'testi'
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .set({ Authorization: `bearer ${token}` })
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })

    test('missing token status is 401 and blog is not added', async () => {
      const newBlog = {
        title: 'uusi blogi',
        author: 'muumi',
        url: 'muuminblogi.fi',
        likes: 42,
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })
  })

  describe('http delete', () => {
    test('succeeds with statuscode 204 with the token of the user that created the blog', async () => {
      const blogs = await helper.blogsInDb()
      const blogToRemove = blogs[0]

      await api
        .delete(`/api/blogs/${blogToRemove.id}`)
        .set({ Authorization: `bearer ${token}` })
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
})

describe('users', () => {

  describe('when there is one user in the database', () => {

    beforeEach(async () => {
      await User.deleteMany({})
      const passwordHash = await bcrypt.hash('kille', 10)
      const user = new User({
        username: 'kalle',
        passwordHash: passwordHash,
      })
      await user.save()
    })

    test('valid user is added', async () => {
      const usersInBeginning = await helper.usersInDb()
      const newUser = {
        username: 'ulla',
        password: 'kakku'
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersInEnd = await helper.usersInDb()
      expect(usersInEnd).toHaveLength(usersInBeginning.length + 1)

      const usernames = usersInEnd.map(u => u.username)
      expect(usernames).toContain('ulla')
    })

    test('invalid user is not added: username already exists, status 400', async () => {
      const usersInBeginning = await helper.usersInDb()
      const newUser = {
        username: 'kalle',
        password: 'kakku'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('expected `username` to be unique')

      const usersInEnd = await helper.usersInDb()
      expect(usersInEnd).toHaveLength(usersInBeginning.length)
    })

    test('invalid user is not added: username too short, status 400', async () => {
      const usersInBeginning = await helper.usersInDb()
      const newUser = {
        username: 'ka',
        password: 'kakku'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('is shorter than the minimum allowed length')

      const usersInEnd = await helper.usersInDb()
      expect(usersInEnd).toHaveLength(usersInBeginning.length)
    })

    test('invalid user is not added: password too short, status 400', async () => {
      const usersInBeginning = await helper.usersInDb()
      const newUser = {
        username: 'kalle',
        password: 'ka'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('password too short')

      const usersInEnd = await helper.usersInDb()
      expect(usersInEnd).toHaveLength(usersInBeginning.length)
    })

    test('invalid user is not added: username missing, status 400', async () => {
      const usersInBeginning = await helper.usersInDb()
      const newUser = {
        password: 'kakku'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('Path `username` is required')

      const usersInEnd = await helper.usersInDb()
      expect(usersInEnd).toHaveLength(usersInBeginning.length)
    })

    test('invalid user is not added: password missing, status 400', async () => {
      const usersInBeginning = await helper.usersInDb()
      const newUser = {
        username: 'kalle',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('password too short')

      const usersInEnd = await helper.usersInDb()
      expect(usersInEnd).toHaveLength(usersInBeginning.length)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})