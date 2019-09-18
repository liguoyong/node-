const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const PushModel = require('../models/pushs')

// GET /signin 登录页
router.get('/', function (req, res, next) {
  const author = req.query.author

  HomeModel.getPosts(author)
    .then(function (posts) {
      res.render('home', {
        posts: posts
      })
    })
    .catch(next)
})

// router.get('/msg/push', function (req, res, next) {
//   const postId = req.params.postId;

//   Promise.all([
//     PostModel.incPv(postId)// pv 加 1
//   ])
//     .then(function (result) {
//       const post = result[0]
//       const comments = result[1]
//       if (!post) {
//         throw new Error('该文章不存在')
//       }

//       res.render('post', {
//         post: post,
//         comments: comments
//       })
//     })
//     .catch(next)
// })
module.exports = router