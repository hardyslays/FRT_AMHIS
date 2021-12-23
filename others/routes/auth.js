const express = require('express')
const router = express.Router()
const passport = require('passport')

router.post('/login' , passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }), 
    (req, res, info) => {
        res.render('login/index', {'message' :req.flash('message')})
    }
)

router.post('/register' , authController.login)

router.get('/logout',authController.logout)

module.exports = router