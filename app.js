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
const req = require('express/lib/request')









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
app.get("/pending-automation-requests", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inv_id = req.user[0].inv_id;

        db.query(`SELECT * FROM connection LEFT JOIN inventories ON connection.rec_id = inventories.inv_id WHERE connection.sen_id="${inv_id}" AND connection.status=0;`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -100});
            }
            else{
                console.log("OK pending");
                res.send({'status': 100, 'body':rows});
            }
        })
    }
})

app.get("/request-history", (req, res) =>{
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inv_id = req.user[0].inv_id;

        db.query(`SELECT * FROM connection LEFT JOIN inventories ON connection.sen_id = inventories.inv_id WHERE connection.rec_id="${inv_id}";`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -150});
            }
            else{
                console.log("OK status");
                console.log(rows)
                res.send({'status': 150, 'body':rows});
            }
        })
    }
})
app.get("/automation-transfer-log-as-sender", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inv_id = req.user[0].inv_id;
        
        db.query(`SELECT * FROM automation_transfer_log LEFT JOIN inventories ON automation_transfer_log.sen_id = inventories.inv_id WHERE automation_transfer_log.sen_id="${inv_id}";`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -1});
            }
            else{
                console.log("OK status");
                console.log(rows)
                res.send({'status': 1, 'body':rows});
            }
        })
    }
})
app.get("/automation-transfer-log-as-receiver", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inv_id = req.user[0].inv_id;
        
        db.query(`SELECT * FROM automation_transfer_log LEFT JOIN inventories ON automation_transfer_log.sen_id = inventories.inv_id WHERE automation_transfer_log.rec_id="${inv_id}";`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -1});
            }
            else{
                console.log("OK status");
                console.log(rows)
                res.send({'status': 1, 'body':rows});
            }
        })
    }
})

app.get("/automation-issue-as-sender", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inv_id = req.user[0].inv_id;
        
        db.query(`SELECT * FROM automation_issue LEFT JOIN inventories ON automation_issue.sen_id = inventories.inv_id WHERE automation_issue.sen_id="${inv_id}";`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -1});
            }
            else{
                console.log("OK status");
                console.log(rows)
                res.send({'status': 1, 'body':rows});
            }
        })
    }
})
app.get("/automation-issue-as-receiver", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inv_id = req.user[0].inv_id;
        
        db.query(`SELECT * FROM automation_issue LEFT JOIN inventories ON automation_issue.sen_id = inventories.inv_id WHERE automation_issue.rec_id="${inv_id}";`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -1});
            }
            else{
                console.log("OK status");
                console.log(rows)
                res.send({'status': 1, 'body':rows});
            }
        })
    }
})
app.get("/item-list", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        db.query(`SELECT * FROM items;`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -1});
            }
            else{
                console.log(rows);
                res.send({'status': 1, 'body': rows});
            }
        })
    }
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
                console.log("couldn't fetch inventory data: ", err);
                res.send({'status': -1});
            }
            else {
                db.query(`SELECT * FROM items WHERE item_id = "${req.body.item_id}"`, (err, rows) => {
                    if(err){
                        console.log("couldn't fetch inventory data: ", err);
                        res.send({'status': -1});
                    }
                    else if(!rows.length){
                        db.query(`INSERT INTO items VALUES("${req.body.item_id}","${req.body.item_name}", "${req.body.item_desc}");`, (err, rows) => {
                            if(err){
                                console.log("couldn't fetch inventory data: ", err);
                                res.send({'status': -1});
                            }
                            else{
                                res.send({'status': 1});
                            }
                        })
                    }
                })
            }
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

app.post("/set-min-quan", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inventory_name = "items_" + req.user[0].inv_id;

        if(parseInt(req.body.quantity) == -1)
        {
            db.query(`UPDATE ${inventory_name} SET min_quantity=NULL WHERE item_id="${req.body.item_id}";`, (err, rows) => {
                if(err){
                    console.log(err);
                    res.send({'status': -51});
                }
                else res.send({'status': 51});
            })
        }
        else
        {
            db.query(`UPDATE ${inventory_name} SET min_quantity=${req.body.quantity} WHERE item_id="${req.body.item_id}";`, (err, rows) => {
                if(err){
                    console.log(err);
                    res.send({'status': -52});
                }
                else res.send({'status': 52});
            })
        }
    }

})

app.post("/automation_sender_table", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inv_id = req.user[0].inv_id;

        db.query(`SELECT * FROM connection LEFT JOIN inventories ON connection.rec_id = inventories.inv_id WHERE connection.sen_id="${inv_id}" AND connection.status=1;`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -1});
            }
            else{
                console.log("OK status");
                res.send({'status': 1, 'body':rows});
            }
        })
    }
})

app.post("/automation_receiver_table", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let inv_id = req.user[0].inv_id;

        db.query(`SELECT * FROM connection LEFT JOIN inventories ON connection.sen_id = inventories.inv_id WHERE connection.rec_id="${inv_id}" AND connection.status=1;`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -1});
            }
            else{
                console.log("OK status");
                res.send({'status': 1, 'body':rows});
            }
        })
    }
})

app.post("/send-connection-request", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let rec_id = req.user[0].inv_id;

        if(rec_id == req.body.sen_id){
            res.send({'status': 120});
            return;
        }

        db.query(`SELECT * FROM inventories WHERE inv_id = "${req.body.sen_id}";`, (err, rows) =>{
            if(err){
                console.log(err);
                res.send({'status': -100});
            }
            else if(!rows.length){
                console.log("No such sender");
                res.send({'status': 110});
            }
            else{
                db.query(`SELECT * FROM items WHERE item_id = "${req.body.item_id}";`, (err, rows) => {
                    if(err){
                        console.log(err);
                        res.send({'status': -100});
                    }
                    else if(!rows.length){
                        console.log("No such item");
                        res.send({'status': 110});
                    }
                    else{
                        db.query(`INSERT INTO connection VALUES("${req.body.sen_id}", "${rec_id}", "${req.body.item_id}", ${req.body.min_quan}, ${req.body.trans_quan}, 0);`, (err, rows) => {
                            if(err){
                                console.log(err);
                                res.send({'status': -100});
                            }
                            else{
                                console.log("OK query");
                                res.send({'status': 100});
                            }
                        })
                    }
                })
            }
        })
    }
})

app.post("/accept-automation-request", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let sen_id = req.user[0].inv_id;

        db.query(`UPDATE connection SET status=1 WHERE sen_id="${sen_id}" AND rec_id="${req.body.rec_id}" AND Item_id="${req.body.item_id}";`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -200});
            }
            else res.send({'status': 200});
        })
    }
})

app.post("/decline-automation-request", (req, res) => {
    console.log(req.body)
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let sen_id = req.user[0].inv_id;

        db.query(`UPDATE connection SET status=-1 WHERE sen_id="${sen_id}" AND rec_id="${req.body.rec_id}" AND Item_id="${req.body.item_id}";`, (err, rows) => {
            if(err){
                console.log(err);
                res.send({'status': -200});
            }
            else res.send({'status': 200});
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



















//// YASHWANT MEENA ////////
app.post("/pending_request", (req, res) => {
    console.log(req.user);
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let data;
        let ID =  req.user[0].inv_id;
        db.query(`SELECT * FROM transfer_log JOIN items ON transfer_log.item_id = items.item_id WHERE transfer_log.sen_id = "${ID}" AND transfer_log.status = 0;`, (err, rows) => {
            if(err){
                console.log("couldn't fetch inventory data: ", err);
                res.send({'status': -1});
            }
            else{
                console.log(rows);
                data = rows;
                res.send({'status': 1, 'body': data});
            }
        })
    }
})

app.post("/add-transferlog", (req, res) => {
    console.log(req.body);
    let sender_ID = req.user[0].inv_id;
    let rece_ID = req.body.rece_id;
    let item_ID = req.body.item_ID;
    let item_Quantity = req.body.item_Quantity;
    let transfer_ID =  Number(new Date());
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        db.query('INSERT INTO transfer_log SET ?',{transfer_id : transfer_ID,rec_id : rece_ID,sen_id :sender_ID,item_id : item_ID,quantity :item_Quantity},(error,rows) => {
           if(error){
               console.log(error);
               res.send({'status': -1});
           }
           else {
                console.log("OK MEENA")
                res.send({'status' : 1}); 
           }
        });
    }
});

app.post("/received-request", (req, res) => {
    console.log(req.user);
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let data;
        let ID =  req.user[0].inv_id;
        console.log(ID);
        db.query(`SELECT * FROM transfer_log WHERE rec_id = "${ID}" AND status = 0;`, (err, rows) => {
            if(err){
                console.log("couldn't fetch inventory data: ", err);
                res.send({'status': -1});
            }
            else{
                console.log(rows);
                data = rows;
                res.send({'status': 1, 'body': data});
            }
        })
    }
});


app.post("/accept-transfer-request", (req, res) => {
    console.log(req.body);
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let data;
        let dec_id = req.body.tras_id;
        console.log("TRANSACTION ID :- ",dec_id);
        db.query(`SELECT * FROM transfer_log WHERE transfer_id = ${dec_id};`,(err,rows) => {
            if(err){
                console.log(err);
                res.send({'status': -1});
            }else{
                console.log(rows);
                console.log("TRANSACTION REQUEST PROCEED .........");
                data = rows;
                if(data.length != 0){
                    let rec_id = data[0].rec_id;
                    let sen_id = data[0].sen_id;
                    let item_id = data[0].item_id;
                    let req_q = data[0].quantity;
                    let rec_Name = "items_" + rec_id;
                    let sen_Name = "items_" + sen_id;
                    console.log(rec_id , sen_id, item_id, req_q, rec_Name, sen_Name);
                    db.query(`SELECT quantity FROM ${rec_Name} WHERE item_id = ${item_id};`,(err,row)=>{
                        if(err){
                            console.log(err);
                            res.send({'status': -1});
                            
                        }
                        else if(!rows.length){
                            let mes = `YOU DO NOT ENOUGH STOCK TO PERFORM THIS TRANSACTION WHERE ITEM ID = ${item_id}`;
                            res.send({'status' : -1,'body' : mes});
                        }
                        else{
                            let ava_q = row[0].quantity;
                            if(ava_q < req_q){
                                let mes = `YOU DO NOT ENOUGH STOCK TO PERFORM THIS TRANSACTION WHERE ITEM ID = ${item_id}`;
                                res.send({'status' : -1,'body' : mes});
                            }else{
                                console.log("PERFORM TRANSACTION................!!!!");
                                db.query(`UPDATE ${rec_Name} SET quantity = ${ava_q - req_q} WHERE item_id = ${item_id};`,(err,result) =>{
                                    if(err){
                                        console.log(err);
                                        res.send({'status' : -1});
                                    }else{
                                        db.query(`SELECT quantity FROM ${sen_Name} WHERE item_id = ${item_id};`,(err,row) => {
                                            if(err){
                                                console.log(err);
                                            }else{
                                                if(row.length != 0){
                                                    console.log("QUANTITY PRESENT......");
                                                    db.query(`UPDATE ${sen_Name} SET quantity = quantity + ${req_q} WHERE item_id = ${item_id};`,(error,result) => {
                                                        if(error){
                                                            console.log(error);
                                                            res.send({'status' : -1});
                                                        }else{
                                                            db.query(`UPDATE transfer_log SET status = 1 WHERE transfer_id = ${dec_id};`,(err,rows) => {
                                                                if(err){
                                                                    console.log(err);
                                                                    res.send({'status' : -1});
                                                                }else{
                                                                    let mes = `TRANSACTION SUCCESSFUL`;
                                                                    res.send({'status' : 1,'body' : mes});
                                                                }
                                                            })
                                                        }
                                                    });
                                                }else{
                                                    console.log("INSERT INTO TABEL......");
                                                    let item_d;
                                                    db.query(`SELECT * FROM items WHERE item_id = ${item_id};`,(err,row) => {
                                                        if(err){
                                                            console.log(err);
                                                            res.send({'status' : -1});
                                                        }else{
                                                            console.log("ITEM DESCRIPTION.....");
                                                            console.log(row);
                                                            item_d = row;
                                                            db.query(`INSERT INTO ${sen_Name} SET ?`,{item_id : item_id, item_name : item_d[0].item_name, item_desc :item_d[0].item_desc,quantity : req_q},(error,rows) =>{
                                                                if(error){
                                                                    console.log(error);
                                                                    res.send({'status' : -1});                                                  
                                                                }else{
                                                                    db.query(`UPDATE transfer_log SET status = 1 WHERE transfer_id = ${dec_id};`,(err,rows) => {
                                                                        if(err){
                                                                            console.log(err);
                                                                            res.send({'status' : -1});
                                                                        }else{
                                                                            let mes = `TRANSACTION SUCCESSFUL`;
                                                                            res.send({'status' : 1,'body' : mes});
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            }
                                        });
                                    }
                                })
                            }
                        }
                    })
                }
            }
        });
    }
});


app.post("/decline-transfer-request", (req, res) => {
    console.log(req.body);
    if(!req.isAuthenticated()){
        console.log("not authorised")
        res.send({'status': 0});
    }
    else{
        let dec_id = req.body.tras_id;
        console.log(dec_id);
        db.query(`UPDATE transfer_log SET status = -1 WHERE transfer_id = ${dec_id};`,(err,rows) => {
            if(err){
                console.log(err);
                res.send({'status' : -1});
            }else{
                let mes = `TRANSACTION DECLINE...`;
                res.send({'status' : 1,'body' : mes});
            }
        })
    }
});


app.post("/load_transfer_log",(req,res) => {
    if(!req.isAuthenticated())res.send({'status': 0});
    else{
        let data;
        let ID =  req.user[0].inv_id;
        db.query(`SELECT * FROM transfer_log JOIN items ON transfer_log.item_id = items.item_id WHERE transfer_log.sen_id = "${ID}" OR transfer_log.rec_id = "${ID}";`, (err, rows) => {
            if(err){
                console.log("couldn't fetch inventory data: ", err);
                res.send({'status': -1});
            }
            else{
                console.log(rows);
                data = rows;
                res.send({'status': 1, 'body': data});
            }
        })
    }
})