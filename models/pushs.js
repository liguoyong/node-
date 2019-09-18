const marked = require('marked')
const Push = require('../lib/mongo').Push
// 将 comment 的 content 从 markdown 转换成 html
Push.plugin('contentToHtml', {
  afterFind: function (comments) {
    return comments.map(function (comment) {
      comment.content = marked(comment.content)
      return comment
    })
  }
})
module.exports = {
  // 根据@：user创建消息推送
  create: function create (push) {
    // return Push.create(push).exec()
    return Push.insertMany(push).exec()
  },

  // 通过留言 id 获取一个留言
  getPushById: function getPushById (pushId) {
    return Push.findOne({ _id: pushId }).exec()
  },

  // 通过留言 id 删除一个留言
  delPushById: function delPushById (pushId) {
    return Push.deleteOne({ _id: pushId }).exec()
  },

  // 通过文章 id 删除该文章下所有留言
  delPushsByPostId: function delPushsByPostId (postId) {
    return Push.deleteMany({ postId: postId }).exec()
  },

  // 通过文章 id 获取该文章下所有留言，按留言创建时间升序
  getPushs: function getPushs (pushId) {
    return Push
      .find({ pushId: pushId })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec()
  },
  // 通过文章 id 获取该文章下留言数
  getPushsCount: function getPushsCount (postId) {
    return Push.count({ postId: postId }).exec()
  }
}
