const express = require('express')
const router = express.Router()



const checkLogin = require('../middlewares/check').checkLogin
const HomeModel = require('../models/home')

// GET /signin 登录页
router.get('/', function (req, res, next) {
    const author = req.query.author
  
    HomeModel.getPosts(author)
      .then(function (posts) {
        console.log(posts)
        res.render('home', {
          posts: posts
        })
      })
      .catch(next)
  })
module.exports = router
