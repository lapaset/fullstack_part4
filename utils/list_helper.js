const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = blogs => {
  const sum = (sum, blog) => {
    return sum + blog.likes
  }
  return blogs.length === 0
    ? 0
    : blogs.reduce(sum, 0)
}

const favoriteBlog = blogs => {
  const favorite = (fav, blog) => {
    return fav.likes === undefined
      ? blog
      : blog.likes > fav.likes
        ? blog
        : fav
  }
  return blogs.length === 0
    ? {}
    : blogs
      .map(b => {
        const blog = {
          title: b.title,
          author: b.author,
          likes: b.likes
        }
        return blog
      })
      .reduce(favorite, {})
}

const mostBlogs = blogs => {
  if (blogs.length === 0)
    return {}

  const blogsByAuthor = _.countBy(blogs, b => b.author)

  const authorWithMostBlogs = Object.keys(blogsByAuthor)
    .reduce((max, author) => blogsByAuthor.author > max.author ? author : max)

  const result = {
    author: authorWithMostBlogs,
    blogs: blogsByAuthor[authorWithMostBlogs]
  }

  return result
}

const mostLikes = blogs => {
  const authors = _.groupBy(blogs, b => b.author)
  let maxLikes = {}

  _.forIn(authors, (blogs, author) => {
    const likes = blogs.reduce((likes, blog) => likes += blog.likes, 0)

    const authorLikes = {
      author: author,
      likes: likes
    }

    if (maxLikes.likes === undefined || likes > maxLikes.likes)
      maxLikes = authorLikes
  })

  return maxLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
