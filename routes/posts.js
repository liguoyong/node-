const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')
const ResouceModel = require('../models/resouce')
const PushModel = require('../models/pushs')
// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?author=xxx
router.get('/', function (req, res, next) {
  const author = req.query.author
  let userId = "";
  if (req.session.user) {
    userId = req.session.user._id;
  }
  // const 
  PostModel.getPosts(author)
    .then(function (posts) {
      //插入其他的元素
      if (userId) {
        PushModel.getPushs(userId)
          .then(function (push) {
            req.session.user.pushNb = push.length;
            res.render('posts', {
              push: push,
              posts: posts
            })
          })
          .catch(next)
      }
    })
    .catch(next)

})

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content
  // 校验参数
  try {
    if (!title.length) {
      res.end('{"msg":"请填写标题","code":808805}')
      // throw new Error('请填写标题');
    }
    if (!content.length) {
      res.end('{"msg":"请填写内容","code":808805}')
      // throw new Error('请填写内容');
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }
  let post = {
    author: author,
    title: title,
    content: content
  }

  PostModel.create(post)
    .then(function (result) {
      // 此 post 是插入 mongodb 后的值，包含 _id
      post = result.ops[0]
      // req.flash('success', '发表成功')
      res.end('{"data":[],"code":0}')
      // 发表成功后跳转到该文章页
      // res.redirect(`/posts/${post._id}`)
    })
    .catch(next)
})

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
  res.render('create')
})

// GET /posts/chat 聊天页
router.get('/chat', checkLogin, function (req, res, next) {
  res.render('chat')
})

// GET /posts/video 视频资源页面
router.get('/video', checkLogin, function (req, res, next) {
  var souceId = req.query.souceId || '';
  if (!souceId) {
    ResouceModel.getResouce()
      .then(function (resouce) {
        // var resouce = JSON.parse(JSON.stringify(resouce));
        res.render('video', {
          resouce: resouce
        })
      }).catch(next)
  } else {
    ResouceModel.getResouceById(souceId)
    .then(function (resouce) {
      console.log(resouce)
        res.render('resouce/videos', {
          souce: resouce
        })
      })
      .catch(next)
  }

})
//GET /posts/set 设置个人信息页
router.get('/set', checkLogin, function (req, res, next) {
  const userId = req.session.user._id
  if (userId) {
    PushModel.getPushs(userId)
      .then(function (push) {
        res.render('admin/admin', {
          push: push
        })
      })
      .catch(next)
  }
})
router.get('/gallery', checkLogin, function (req, res, next) {
  res.render('resouce/gallery')
})

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function (req, res, next) {
  const postId = req.params.postId

  Promise.all([
    PostModel.getPostById(postId), // 获取文章信息
    CommentModel.getComments(postId), // 获取该文章所有留言
    PostModel.incPv(postId)// pv 加 1
  ])
    .then(function (result) {
      const post = result[0]
      const comments = result[1]
      if (!post) {
        throw new Error('该文章不存在')
      }

      res.render('post', {
        post: post,
        comments: comments
      })
    })
    .catch(next)
})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        // res.end('{"msg":"该文章不存在","code":808805}')
        throw new Error('该文章不存在')
      }
      if (author.toString() !== post.author._id.toString()) {
        // res.end('{"msg":"权限不足","code":808805}')
        throw new Error('权限不足')
      }
      res.render('edit', {
        post: post
      })
    })
    .catch(next)
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content
  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  // 校验参数
  try {
    if (!title.length) {
      res.end('{"msg":"请填写标题","code":808805}')
      // throw new Error('请填写标题')
    }
    if (!content.length) {
      res.end('{"msg":"请填写内容","code":808805}')
      // throw new Error('请填写内容')
    }
  } catch (e) {
    console.log("fdsgsdg", '{"msg":"' + e.message + '","code":808805}')
    res.end('{"msg":"' + e.message + '","code":808805}')
  }
  PostModel.getRawPostById(postId)
    .then(function (post) {
      console.log("dsfsdf")
      if (!post) {
        res.end('{"msg":"文章不存在","code":808805}')
        // throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        res.end('{"msg":"没有权限","code":808805}')
        // throw new Error('没有权限')
      }
      PostModel.updatePostById(postId, { title: title, content: content })
        .then(function () {
          var data = { "code": 0, "data": [] };
          data = JSON.stringify(data)
          res.end(data)
        })
        .catch(next)
    })
})

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }
      PostModel.delPostById(postId)
        .then(function () {
          req.flash('success', '删除文章成功')
          // 删除成功后跳转到主页
          res.redirect('/posts')
        })
        .catch(next)
    })
})

// POST /msg/getpush 更新一篇文章
router.post('/getpush', checkLogin, function (req, res, next) {
  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  const pushId = req.fields.pushId
  // 校验参数
  try {
    if (!pushId.length) {
      res.end('{"msg":"评论或回复不存在","code":808805}')
      // throw new Error('评论或回复不存在')
    }
    // if(!author.length){
    //   throw new Error('用户不存在')
    // }
  } catch (e) {
    // req.flash('error', e.message)
    // return res.redirect('back')
    res.end('{"msg":"' + e.message + '","code":808805}')
  }

  PushModel.getPushs(pushId)
    .then(function (push) {
      if (!push) {
        throw new Error('文章不存在')
      }
      push = JSON.stringify(push)
      // req.flash('success', '发表成功')
      res.end('{"data":' + push + ',"code":0}')
    })
})
module.exports = router
