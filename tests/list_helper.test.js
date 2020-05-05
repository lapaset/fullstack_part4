const listHelper = require('../utils/list_helper')

const listOfOne = [
  {
    _id: '5ea2c504678e81cd24a8c5ee',
    title: 'muumin blogi',
    author: 'muumi',
    url: 'muuminblogi.fi',
    likes: 42,
    __v: 0
  }
]

const listOfThree = [
  {
    _id: '5ea2c504678e81cd24a8c5ee',
    title: 'muumin blogi',
    author: 'muumi',
    url: 'muuminblogi.fi',
    likes: 42,
    __v: 0
  },
  {
    _id: '89743274a8c5ee',
    title: 'mymmelin blogi',
    author: 'mymmeli',
    url: 'mymmelinblogi.fi',
    likes: 7300,
    __v: 0
  },
  {
    _id: '98curqudj2pja8c5ee',
    title: 'pirkon blogi',
    author: 'muumi',
    url: 'pirkkorulaa.fi',
    likes: 420,
    __v: 0
  }
]

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })

  test('of one is the likes of that blog', () => {
    expect(listHelper.totalLikes(listOfOne)).toBe(42)
  })

  test('of many is the sum of likes', () => {
    expect(listHelper.totalLikes(listOfThree)).toBe(7762)
  })
})

describe('favorite blog', () => {
  test('of empty list is {}', () => {
    expect(listHelper.favoriteBlog([])).toEqual({})
  })

  test('of one to be the one', () => {
    expect(listHelper.favoriteBlog(listOfOne)).toEqual({
      title: 'muumin blogi',
      author: 'muumi',
      likes: 42
    })
  })

  test('of many is the one with most likes', () => {
    expect(listHelper.favoriteBlog(listOfThree)).toEqual({
      title: 'mymmelin blogi',
      author: 'mymmeli',
      likes: 7300
    })
  })
})

describe('most blogs', () => {
  test('of empty list is {}', () => {
    expect(listHelper.mostBlogs([])).toEqual({})
  })

  test('of one is the author', () => {
    expect(listHelper.mostBlogs(listOfOne)).toEqual({
      author: 'muumi',
      blogs: 1
    })
  })

  test('of many to be the author with most blogs', () => {
    expect(listHelper.mostBlogs(listOfThree)).toEqual({
      author: 'muumi',
      blogs: 2
    })
  })
})

describe('most likes', () => {
  test('of empty list is {}', () => {
    expect(listHelper.mostLikes([])).toEqual({})
  })
  test('of one is the author', () => {
    expect(listHelper.mostLikes(listOfOne)).toEqual({
      author: 'muumi',
      likes: 42
    })
  })
  test('of many to be the author with most likes', () => {
    expect(listHelper.mostLikes(listOfThree)).toEqual({
      author: 'mymmeli',
      likes: 7300
    })
  })
})