const bcrypt = require('bcrypt')

exports.hash = bcrypt.hash(password, 10, (err, hash) =>{
    let res = {
        'stat' : 0,
        'res' : null
    }
    if(!err){
        res.stat = 1;
        res.res = hash;
    }

    return res
})