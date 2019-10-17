var express = require('express');
var router = express.Router();
// var bodyParser = require('body-parser');
var mongo = require('mongoose');
var url = 'mongodb://localhost:27017/shopping';
var assert = require('assert');
var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');
// css
var pathAbout = '/stylesheets/about-page.css';
var pathMenu ='/stylesheets/menu-page.css';
var pathInfo = '/stylesheets/info-dish.css';
var pathCart = '/stylesheets/shopping-cart-page.css';
// var objectId = require('mongoose');
/* GET home page. */
router.get('/', function (req, res, next) {

  var successMsg = req.flash('success')[0];
  Product.find(function (err, docs) {
    var resultArray = [];
    var chunkSize = 4;
    for (var i = 0; i < 8; i += chunkSize) {
      resultArray.push(docs.slice(i, i + chunkSize));
    }
    res.render('shop/home', {title: 'Home', products: resultArray,successMsg: successMsg, noMessages: !successMsg});
  });
});



router.get('/menu', function(req, res, next) {


  res.render('shop/menu-page', {title:'Menu',promenu_css:pathMenu});
});


router.get('/about',function (req,res,next) { // chọn tên đường đẫn đéo
  res.render('shop/about-page',{title:'Giới thiệu',about_css:pathAbout}); // chọn đường đẫn đến file  , giờ là admin-rac/GUI.hbs
});


router.get('/info',function (req,res,next) {

  res.render('shop/info-dish',{infor_css:pathInfo});
});

router.get('/add-to-cart/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId, function(err, product) {
    if (err) {
      return res.redirect('/home');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/home/shopping-cart');
  });
});
router.get('/remove-from-cart/:id',function (req,res,next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId, function(err, product) {
    if (err) {
      return res.redirect('/home');
    }
    cart.remove(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/home/shopping-cart');
  });
})
router.get('/shopping-cart', function(req, res, next) {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart-page', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart-page', {products: cart.generateArray(), totalPrice: cart.totalPrice , cart_css:pathCart});
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);

  var stripe = require("stripe")(
      "sk_test_fwmVPdJfpkmwlQRedXec5IxR"
  );

  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "vnd",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: "Test Charge"
  }, function(err, charge) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    });
    order.save(function(err, result) {
      req.flash('success', 'Successfully bought product!');
      req.session.cart = null;
      res.redirect('/');
    });
  });
});
module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}
