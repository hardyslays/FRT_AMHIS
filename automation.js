const mysql = require('mysql')
require('dotenv').config()

const db = mysql.createConnection({
    host: "amhis-frt-server.mysql.database.azure.com",
    user: "hardy@amhis-frt-server",
    password : "pAgeslays444",
    database: "amhis_frt_db",
    port : '3306',
})

const success_transaction = (sen_id, rec_id, item_id, transfer_quan) => {
    let sen_inv_id = "items_" + sen_id;
    let rec_inv_id = "items_" + rec_id;

    db.query(`UPDATE ${sen_inv_id} SET quantity = quantity - ${transfer_quan} WHERE item_id = "${item_id}";`, (err, rows) => {
        if(err){
            console.log(err)
        }
        else{
            db.query(`UPDATE ${rec_inv_id} SET quantity = quantity + ${transfer_quan} WHERE item_id = "${item_id}";`, (err, rows) => {
                if(err){
                    console.log(err);
                }
                else{
                    let timestamp = new Date().getTime();
                    db.query(`INSERT INTO automation_transfer_log VALUES("${timestamp}", "${rec_id}", "${sen_id}", "${item_id}", ${transfer_quan});`, (err) => {
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log("DONE");
                        }
                    })
                }
            })
        }
    })
}

const transaction_failed = (sen_id, rec_id, item_id, transfer_quan) => {
    let timestamp = new Date().getTime();
    db.query(`INSERT INTO automation_issue VALUES("${timestamp}", "${rec_id}", "${sen_id}", "${item_id}", ${transfer_quan});`, (err) => {
        if(err){
            console.log(err)
        }
    })
}

const transfer = (sen_id, rec_id, item_id, transfer_quan) => {
    let sen_inv_id = "items_" + sen_id;
    let rec_inv_id = "items_" + rec_id;
    db.query(`SELECT quantity FROM ${sen_inv_id} WHERE item_id = "${item_id}";`, (err, rows) => {
        if(err){
            console.log(err)
        }
        else{
            console.log(sen_inv_id, ": ", rows)
            console.log(rows[0].quantity, " ", transfer_quan)
            if(rows[0].quantity >= transfer_quan){
                console.log("SUCESS TRANSACTION: ", sen_id, " " , rec_id, " ", item_id);
                success_transaction(sen_id, rec_id, item_id, transfer_quan);
            }
            else{
                transaction_failed(sen_id, rec_id, item_id, transfer_quan);
            }
        }
    })
}

const automate = (req) => {

    let rec_id = req.body.req_id;
    let item_id = req.body.item_id;
    let quan = req.body.quan;

    console.log(req.body);

    db.query(`SELECT * FROM connection WHERE rec_id = "${rec_id}" AND Item_id = "${item_id}";`, (err, rows) => {
        if(err){
            console.log(err)
        }
        else{
            console.log("connections: ",rows)
            rows.forEach(el => {
                if(el.min_quantity > quan){
                    transfer(el.sen_id, el.rec_id, el.Item_id, el.transfer_quantity);
                }
            })
        }
    })
    console.log("Done the automation")
    // context.res = {
    //     // status: 200, /* Defaults to 200 */
    //     body: "DONE THIS"
    // };
}

module.exports = automate;