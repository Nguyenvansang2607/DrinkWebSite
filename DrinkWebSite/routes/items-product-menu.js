var express = require('express');
var router = express.Router();
var url = 'mongodb://localhost:27017/shopping';
var mongo = require('mongoose');
var assert = require('assert');


router.get('/item', function(req, res, next) {

    mongo.connect(url,{useNewUrlParser:true},function(err ,db) {
        assert.equal(null, err);
        res.render('shop/item-product-part', {title:'BLOG',blog_css:path});
    });

});
module.exports = router;