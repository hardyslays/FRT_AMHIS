const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const flash = require('flash')
const bcrypt = require('bcrypt')

app.use(passport.initialize())
app.use(passport.session())

exports.serializeUser = passport.serializeUser(function(user, done){
    done(null, user.inv_id);
});

exports.deserializeUser = passport.deserializeUser(function(id, done){
    connection.query("select * from inventories where inv_id = "+ id, (err, rows) => {
        done(err, rows[0]);
    });
});

exports.use = passport.use('local', new localStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true //passback entire req to call back
    },
    (req, username, password, done) => {
        if(!username || !password){
            return done(null, false, req.flash('message', 'All fields are required'))
        }

        
        db.query('select * from inventories where username = ?', [username], (err, rows) =>{
            console.log(err)
            console.log(rows)

            if(err) return done({'message': err})
            if(!rows.length)return done(null, false, req.flash('message', 'No such User found'))

            let DBpassword = rows[0].password;
            bcrypt.compare(password, DBpassword, (err, res) =>{
                if(err){
                    console.log(err)
                    return done({'message': err})
                }

                if(!res){
                    return done(null, false, req.flash('message', 'Incorrect password for the user'))
                }

                return done(null, rows[0]);
            })
        })
    }  
))