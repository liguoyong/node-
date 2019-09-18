var http = require('http') // Node.js提供了http模块，用于搭建HTTP服务端和客户端
var eare = "http://www.zuidazy1.net";
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;//cnpm install mongodb
var Dburl = "mongodb://localhost:27017/";
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/myblog';
function trimString(string) {
  string = string.replace(/\r\n/g, "")
  string = string.replace(/\n/g, "");
  //去掉所有的空格（中文空格、英文空格都会被替换）
  string = string.replace(/\s/g, "");
  return string
}
MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
  if (err) throw err;
  console.log('数据库已创建');
  var dbase = db.db("myblog");
  dbase.createCollection('resouces', function (err, res) {
    if (err) throw err;
    console.log("创建集合!");
    db.close();
  });
});
var url = 'http://www.zuidazy1.net/?m=vod-type-id-1.html' //输入任何网址都可以
var cheerio = require('cheerio') // 抓取页面模块，为服务器特别定制的，快速、灵活、实施的jQuery核心实现
http.get(url, function (res) {  //发送get请求
  var html = ''
  res.on('data', function (data) {
    html += data  //字符串的拼接
  })
  res.on('end', function () {
    var data = filterChapters(html);
  })
}).on('error', function () {
  console.log('获取资源出错！')
})
function filterChapters(html) {
  var $ = cheerio.load(html)  // 加载需要的html，然后就可以愉快地使用类似jQuery的语法了
  var chapters = $('.xing_vb ul')  //在html里寻找需要的资源的class
  var courseData = [] // 创建一个数组，用来保存资源
  var data = {}, brr = [];
  chapters.each(async function (item, index) {  //遍历我们的html文档
    if (item > 1 && item < chapters.length - 1) {
      var chapter = $(this)
      var chapterUrl = chapter.find('a').attr('href');
      var souceId = chapterUrl.match(/vod-detail-id-(\S*).html/)[1];
      var chapterName = chapter.find('a').text();
      var chapterType = chapter.find('.xing_vb5').text();
      var chapterUpdate = chapter.find('.xing_vb6').text();
      var address = "", newobj = {};

    }
    if (chapterUrl) {
      var ind = await ins(eare, chapterUrl, courseData);
      // console.log(ind,"1212")

      brr.push(ind)
      // console.log(brr)
      courseData.push({
        souceId: souceId,
        chapterName: chapterName,
        chapterUrl: chapterUrl,
        chapterType: chapterType,
        chapterUpdate: chapterUpdate,
        address: ind
      })
    }
  })
  setTimeout(function () {
    // console.log(brr,courseData)
    var dt = JSON.stringify(courseData)
    // fs.writeFile(__dirname + "/" + "list.json", dt, function (err, data) {
    //   if (err) {
    //     return console.error(err);
    //   }
    //   console.log("异步读取文件数据: " + dt);
    // });
    MongoClient.connect(Dburl, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("myblog");
      var myobj = courseData;
      dbo.collection("resouces").insertMany(myobj, function (err, res) {
        if (err) throw err;
        console.log("插入的文档数量为: " + res.insertedCount);
        db.close();
      });
    });
  }, "15000")
  // return courseData//返回需要的资源
}
function ins(eare, chapterUrl, courseData) {
  var inter;
  return new Promise(function (resolve, reject) {
    var url = eare + chapterUrl, newobj = {}
    http.get(url, function (res) {  //发送get请求
      var html = '';
      res.on('data', function (data) {
        html += data  //字符串的拼接
      })
      res.on('end', function () {
        var $ = cheerio.load(html);
        var chapters = $('.vodplayinfo').children("div").children("div");
        var information = $('.vodinfobox').find("li")
        console.log(information.length)
        var image = $('.vodImg').children('img').attr("src");
        var name = $('.vodImg').children('img').attr("alt");
        var chapterDetaile = $('.more').text();
        newobj["image"] = image;
        newobj["name"] = name;
        newobj['chapterDetaile'] = chapterDetaile;
        chapters.each(function (item, index) {
          var input = $(this)
          var inputVal = input.find('[name="copy_sel"]').val();
          var type = input.find('.suf').text();
          newobj[type] = inputVal;
        });
        information.each(function (item, index) {
          var string = trimString($(this).text());
          if (string.indexOf('：') != -1) {
            newobj[string.split('：')[0]] = string.split('：')[1]
          }
        })
        // console.log(newobj)
        resolve(newobj);
      })
      

    }).on('error', function () {
      console.log('获取资源出错！')
    })
  }).then(function (newobj) {
    inter = newobj;
    inter = JSON.stringify(inter)
    return inter;
  })

}


