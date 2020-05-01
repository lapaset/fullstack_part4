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
    : blogs.reduce(favorite, {})
}

const mostBlogs = blogs => {
  const result = blogs
    .reduce((authors, blog) => {
      console.log('blog', blog)
      console.log('authors', authors)
      authors[blog.author] = authors[blog.author] || {}
      authors[blog.author].name = blog.author
      authors[blog.author].blogs = authors[blog.author].blogs + 1 || 1
      console.log('authors end of function', authors)
      return authors
    }, [])

  console.log('result', result)

  console.log(result['muumi'].blogs)

  return result
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}
