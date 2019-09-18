const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const CommentModel = require('../models/comments')
const PushModel = require('../models/pushs')

// POST /comments 创建一条留言
router.post('/', checkLogin, function (req, res, next) {
  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  const author = req.session.user._id
  const postId = req.fields.postId
  const content = req.fields.content
  const pushId =req.fields.pushId
  const content_txt =req.fields.content_txt
  console.log(content_txt)
  // 校验参数
  try {
    if (!content.length) {
      res.end('{"msg":"请填写留言内容","code":808805}')
      // throw new Error('请填写留言内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    res.end('{"msg":"'+e.message+'","code":"8088056"}')
    return res.redirect('back')
  }

  const comment = {
    author: author,
    postId: postId,
    content: content,
    content_txt:content_txt
  }
  var push_arr=[];
  if(pushId&&pushId.length>0){
    var pusharr=pushId.split(",")
    for(var i=0;i<pusharr.length;i++){
     var push ={
        author: author,
        postId: postId,
        pushId:pusharr[i],
        content: content,
        content_txt:content_txt
      };
      push_arr.push(push);
    }
  }
  CommentModel.create(comment)
    .then(function () {
      // req.flash('success', '留言成功')
      res.end('{"data":[],"code":0}')
      //生成推送消息
      if(pushId&&pushId.length>0){
      PushModel.create(push_arr)
      .then(function(){
  
      })
      .catch(next)
      // 留言成功后跳转到上一页
      // res.redirect('back')
    }
    })
    .catch(next)
    
    
})

// GET /comments/:commentId/remove 删除一条留言
router.get('/:commentId/remove', checkLogin, function (req, res, next) {
  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  const commentId = req.params.commentId
  const author = req.session.user._id

  CommentModel.getCommentById(commentId)
    .then(function (comment) {
      if (!comment) {
        res.end('{"msg":"留言不存在","code":808805}')
        // throw new Error('留言不存在')
      }
      if (comment.author.toString() !== author.toString()) {
        res.end('{"msg":"没有权限删除留言","code":808805}')
        // throw new Error('没有权限删除留言')
      }
      CommentModel.delCommentById(commentId)
        .then(function () {
          res.end('{"data":[],"code":0}')
          // req.flash('success', '删除留言成功')
          // // 删除成功后跳转到上一页
          // res.redirect('back')
        })
        .catch(next)
    })
})

module.exports = router
