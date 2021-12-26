//Import node modules
const express = require('express')
const session = require('express-session')
const ejs = require('ejs')
const bcrypt = require('bcrypt')
const db = require("./db")
const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const flash = require('flash')
const { redirect } = require('express/lib/response')









//Import and config env file
require('dotenv').config()

//Set up Port number
const PORT = process.env.PORT

//Create and configure express server
const app = express()
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(session({
    secret : process.env.secret,
    resave: false,
    saveUninitialized: true
}))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(require('flash')());







//Passport setup
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
    done(null, user.inv_id);
});

passport.deserializeUser((inv_id, done) => {
    db.query("select * from inventories where inv_id = ?",[inv_id], (err, rows) => {
        done(err, rows);
    });
});

passport.use('local', new localStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true //passback entire req to call back
    },
    (req, username, password, done) => {
        
        db.query('select * from inventories where inv_username = ?', [username], (err, rows) =>{
            console.log(err)
            console.log("Rows: ", rows[0])

            if(err) return done({'message': err})
            if(!rows.length)return done(null, false)

            let DBpassword = rows[0].inv_password;
            bcrypt.compare(password, DBpassword, (err, res) =>{
                if(err){
                    console.log(err)
                    return done({'message': err})
                }

                if(!res){
                    return done(null, false)
                }

                return done(null, rows[0]);
            })
        })
    }  
))













//<---------------ROUTES----------->

//Middlewares
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) return next();
    res.redirect('/login')
}

function isLoggedOut(req, res, next) {
    if(!req.isAuthenticated()) return next();
    res.redirect('/')
}

function isDuplicateId(req, res, next){
    let id = req.body.id;
    console.log(id)
    db.query("SELECT * FROM inventories WHERE inv_id = ?", [id], (err, rows) => {
        if(err){
            console.log("DB err: ", err)
            res.redirect('/register?err=server')
        }
        else if(rows.length){
            console.log("duplicate err: ", rows)
            res.redirect('/register?err=duplicate-id')
        }
        else return next();
    })
}

function isDuplicateUsername(req, res, next){
    let username = req.body.username;
    db.query("SELECT * FROM inventories WHERE inv_username = ?", [username], (err, rows) => {
        console.log(rows)
        if(err){
            console.log("DB err: ", err)
            res.redirect('/register?err=server')
        }
        else if(rows.length){
            console.log("duplicate err: ", rows)
            res.redirect('/register?err=duplicate-username')
        }
        else return next();
    })
}

//GET routes
app.get('/', isLoggedIn, (req, res) =>{
    res.render('home', { 'loggedIn': req.isAuthenticated()})
})
app.get('/login', isLoggedOut, (req, res) =>{
    res.render('login', { 'loggedIn': req.isAuthenticated(), 'message': (req.query)?req.query : null})
})
app.get('/register', isLoggedOut, (req, res) =>{
    res.render('register', {'loggedIn': req.isAuthenticated(), 'message': (req.query)?req.query : null})
})
app.get('/logout', isLoggedIn, (req,res) =>{
    req.logout()

    res.redirect('/')
})

//POST routes
app.post('/login' , passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login?err=true'
    })
)
app.post('/register', [isDuplicateId, isDuplicateUsername], (req, res) => {
    let {id, name, username, password} = req.body;
    console.log(id)
    console.log(name)
    console.log(username)
    console.log(password)

    //Create inventory of Nes user using inventory Id
    let inventory_name = "items_" + id;
    db.query(`CREATE TABLE ${inventory_name} (item_id VARCHAR(256) PRIMARY KEY, item_name VARCHAR(100), item_desc VARCHAR(200), quantity INT, min_quantity INT);`, (err) => {
        if(err)console.log("DB err in creating inventory table: ", err);
        else{
            console.log("Succesfully created New user's Inventory");
        }
    })
    
    //Hash the password to store it in database
    bcrypt.hash(password, 10, (err, hash) => {
        if(err){
            console.log("bcrypt err: ",err)
            res.redirect('/register?err=server')
        }
        else{
            db.query(`INSERT INTO inventories VALUES ('${id}', '${name}', '${username}', '${hash}');`, (err) =>{
                if(err){
                    console.log("DB err: ", err)
                    res.redirect('/register?err=server')
                }
                else console.log("SUCCESS")
            })
        }
    })

    //If everything runs successfully, Redirect user to the login page
    res.redirect('/login')
})

app.post("/inv-list", (req, res) => {
    console.log(req.user);
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let data;
        let inventory_name = "items_" + req.user[0].inv_id;
        db.query(`SELECT * FROM ${inventory_name};`, (err, rows) => {
            if(err){
                console.log("couldn't fatch inventory data: ", err);
                res.send({'status': -1});
            }
            else{
                data = rows;
                res.send({'status': 1, 'body': data});
            }
        })
    }
})

app.post("/add-item", (req, res) => {
    console.log(req.user);
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inventory_name = "items_" + req.user[0].inv_id;
        db.query(`INSERT INTO ${inventory_name}(item_id,item_name,item_desc,quantity) VALUES("${req.body.item_id}", "${req.body.item_name}", "${req.body.item_desc}", ${req.body.quantity});`, (err, rows) => {
            if(err){
                console.log("couldn't fatch inventory data: ", err);
                res.send({'status': -1});
            }
            else res.send({'status': 1});
        })
    }
})

app.post("/add-quantity", (req, res) => {
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inventory_name = "items_" + req.user[0].inv_id;
        db.query(`SELECT * FROM ${inventory_name} WHERE item_id = "${req.body.item_id}";`, (err, rows) => {
            if(err){
                console.log("couldn't fatch inventory data: ", err);
                res.send({'status': -10});
            }
            else{
                if(!rows.length){
                    res.send({'status': 11});
                }
                else{
                    console.log(rows[0]);
                    
                    let prev_quantity = rows[0].quantity;
                    let new_quantity =  prev_quantity + parseInt(req.body.quantity);

                    db.query(`UPDATE ${inventory_name} SET quantity = ${new_quantity} WHERE item_id = "${req.body.item_id}";`, (err, rows) => {
                        if(err){
                            console.log("couldn't fatch inventory data: ", err);
                            res.send({'status': -10});
                        }
                        else{
                            res.send({'status': 10});
                        }
                    })
                }
            }
        })
    }
})

app.post("/rem-quantity", (req, res) =>{
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inventory_name = "items_" + req.user[0].inv_id;
        db.query(`SELECT * FROM ${inventory_name} WHERE item_id = "${req.body.item_id}";`, (err, rows) => {
            if(err){
                console.log("couldn't fatch inventory data: ", err);
                res.send({'status': -20});
            }
            else{
                if(!rows.length){
                    res.send({'status': 21});
                }
                else{
                    console.log(rows[0]);
                    
                    let prev_quantity = rows[0].quantity;
                    if(prev_quantity < req.body.quantity)res.send({'status': 22});
                    else{
                        let new_quantity = prev_quantity - req.body.quantity;
                        db.query(`UPDATE ${inventory_name} SET quantity = ${new_quantity} WHERE item_id="${req.body.item_id}";`, (err, rows) => {
                            if(err){
                                res.send({'status': -20});
                            }
                            else{
                                res.send({'status': 20});
                            }
                        })
                    }
                }
            }
        })
    }
})

app.post('/rem-item-details', (req, res) => {
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inventory_name = "items_" + req.user[0].inv_id;
        db.query(`SELECT * FROM ${inventory_name} WHERE item_id="${req.body.item_id}";`, (err, rows) => {
            if(err){
                console.log("Cannot fetch data:", err);
                res.send({'status': -20});
            }
            else if(!rows.length){
                console.log('No item found');
                res.send({'status': 21});
            }
            else{
                let body = {
                    'item_id': rows[0].item_id,
                    'item_name': rows[0].item_name,
                    'item_desc': rows[0].item_desc,
                    'quantity': rows[0].quantity,
                }
                res.send({'status': 20, 'body': body});
            }
        })
    }
})
app.post("/rem-item", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inventory_name = "items_" + req.user[0].inv_id;
        
        db.query(`DELETE FROM ${inventory_name} WHERE item_id="${req.body.item_id}";`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -41});
            }
            else{
                console.log("item removed");
                res.send({'status': 40});
            }
        })
    }
})







//Database connection setup
db.connect( (error) => {
    if(error){
        console.log("DATABASE connection err:\n", error);
    }
    else{
        console.log("DATABASE connected..........");
    }
});


//Open server to listen
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});


// YASHWANT //
app.get("/item_transfer",(req,res) => {
    

})
