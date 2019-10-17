var express = require('express');
var router = express.Router();
var path = '/stylesheets/blog-page.css';
var url = 'mongodb://localhost:27017/shopping';
var mongo = require('mongoose');
var assert = require('assert');


router.get('/blog', function(req, res, next) {

    mongo.connect(url,{useNewUrlParser:true},function(err ,db) {
        assert.equal(null, err);
        var blog = [];
        db.collection('new-blog').find().limit(4).toArray(function (err,docs) {
            if (err) throw err;
            // console.log(docs);
            blog.push(docs);
        });
        db.close();
        res.render('shop/blog-page', {title:'BLOG',blog: blog ,blog_css:path});
    });

});
module.exports = router;