const marked = require('marked')
const Resouce = require('../lib/mongo').Resouce

module.exports = {
  // 通过文章 id 获取一篇文章
  getResouceById: function getPostById (souceId) {
    return Resouce
      .findOne({ souceId: souceId })
      .addCreatedAt()
      .exec()
  },
  getResouce: function getResouce (find,limit) {
    var findobj ={};
      if(find){
        findobj={"chapterName":/find/}
      }
    return Resouce
      .find(findobj)
      .limit(80)
      .sort({ _id: 1 })
      .addCreatedAt()
      .exec()
  }
}
