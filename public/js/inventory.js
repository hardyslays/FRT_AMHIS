function setActive(id){
    document.getElementById("inv-list-btn").classList.remove("btn-dark");
    document.getElementById("inv-list-btn").classList.add("btn-outline-dark");
    document.getElementById("inv-add-btn").classList.remove("btn-dark");
    document.getElementById("inv-add-btn").classList.add("btn-outline-dark");
    document.getElementById("inv-rem-btn").classList.remove("btn-dark");
    document.getElementById("inv-rem-btn").classList.add("btn-outline-dark");
    
    document.getElementById(id).classList.remove("btn-outline-dark");
    document.getElementById(id).classList.add("btn-dark");
 
    document.getElementById("inv-items").style.display = "none";
    document.getElementById("add-inv").style.display = "none";
    document.getElementById("rem-inv").style.display = "none";

    switch(id){
        case "inv-list-btn": document.getElementById("inv-items").style.display = "";
        break;
        
        case "inv-add-btn": document.getElementById("add-inv").style.display = "";
        break;
        
        case "inv-rem-btn": document.getElementById("rem-inv").style.display = "";
        break;
    }
}

function make_inv_table(body){
    let inv_body = document.getElementById('inv-body');

    inv_body.innerHTML = "";

    body.forEach(el => {
        let row = document.createElement('div');
        row.classList.add("row");
        
        let id_col = document.createElement('div');
        id_col.classList.add("col", "col-1");
        id_col.innerText = el.item_id;
        
        let name_col = document.createElement('div');
        name_col.classList.add("col", "col-2");
        name_col.innerText = el.item_name;
        
        let desc_col = document.createElement('div');
        desc_col.classList.add("col", "col-5");
        desc_col.innerText = el.item_desc;
        
        let quan_col = document.createElement('div');
        quan_col.classList.add("col");
        quan_col.innerText = el.quantity;
        
        let min_quan_col = document.createElement('div');
        min_quan_col.classList.add("col");
        min_quan_col.innerText = (el.min_quantity == null? "N/A" : el.min_quantity);

        row.appendChild(id_col);
        row.appendChild(name_col);
        row.appendChild(desc_col);
        row.appendChild(quan_col);
        row.appendChild(min_quan_col);
        inv_body.appendChild(row);
    });
}

function load_inventory_list(){
    fetch("/inv-list", {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        }
    })
    .then(response => response.json())
    .then( data => {
        console.log(data);
        if(data.status == 1){
            setActive("inv-list-btn");

            make_inv_table(data.body);
        }
        else{
            alert("Something went wrong while fetchin Inventory details.\nLogout and login again to fix the issue, Or contact the admin if problem pursue.");   
        }
    });
}

function load_add_item(){
    document.getElementById("item_id").value = "";
    document.getElementById("item_name").value = "";
    document.getElementById("item_desc").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("item_id2").value = "";
    document.getElementById("quantity2").value = "";
    
    item_id.classList.remove("empty_inp");
    item_name.classList.remove("empty_inp");
    item_desc.classList.remove("empty_inp");
    quantity.classList.remove("empty_inp");
    item_id2.classList.remove("empty_inp");
    quantity2.classList.remove("empty_inp");
    
    setActive("inv-add-btn");    
}

function adding_item_successful(){
    load_add_item();

    document.getElementById("add-item-response").innerText = "Item added succesfully.";
    document.getElementById("add-item-response").style.display = "";
    setTimeout(() => {
        document.getElementById("add-item-response").style.display = "none";
    }, 5000);
}
function adding_quantity_successful(){
    load_add_item();

    document.getElementById("add-item-response").innerText = "Quantity increased succesfully.";
    document.getElementById("add-item-response").style.display = "";
    setTimeout(() => {
        document.getElementById("add-item-response").style.display = "none";
    }, 5000);
}

function adding_item_failed(){
    load_add_item();

    document.getElementById("add-item-response").innerText = "Adding item failed. Please try again.";
    document.getElementById("add-item-response").style.display = "";
    setTimeout(() => {
        document.getElementById("add-item-response").style.display = "none";
    }, 5000);
}

function adding_quantity_item_not_found(){
    load_add_item();

    document.getElementById("add-item-response").innerText = "No item found for given ITEM ID.";
    document.getElementById("add-item-response").style.display = "";
    setTimeout(() => {
        document.getElementById("add-item-response").style.display = "none";
    }, 5000);
}

function adding_quantity_failed(){
    load_add_item();

    document.getElementById("add-item-response").innerText = "Failed in increasing Item's quantity. Please try again.";
    document.getElementById("add-item-response").style.display = "";
    setTimeout(() => {
        document.getElementById("add-item-response").style.display = "none";
    }, 5000);
}

function submit_add_item_form(){
    let item_id = document.getElementById("item_id");
    let item_name = document.getElementById("item_name");
    let item_desc = document.getElementById("item_desc");
    let quantity = document.getElementById("quantity");

    if(item_id.value == "")item_id.classList.add("empty_inp");
    else item_id.classList.remove("empty_inp");
    if(item_name.value == "")item_name.classList.add("empty_inp");
    else item_name.classList.remove("empty_inp");
    if(item_desc.value == "")item_desc.classList.add("empty_inp");
    else item_desc.classList.remove("empty_inp");
    if(quantity.value == "")quantity.classList.add("empty_inp");
    else quantity.classList.remove("empty_inp");

    if(item_id.value == "" || item_name.value == "" || item_desc.value == "" || quantity.value == "")return;

    body = {
        'item_id': item_id.value,
        'item_name': item_name.value,
        'item_desc': item_desc.value,
        'quantity': quantity.value
    };

    // console.log(body);
    fetch("/add-item", {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(body)
    })
    .then(response => response.json())
    .then( data => {
        console.log(data)
        if(data.status == 1){
            adding_item_successful();
        }
        else adding_item_failed();
    });
}

function submit_add_quantity(){
    let item_id = document.getElementById("item_id2");
    let quantity = document.getElementById("quantity2");

    if(item_id.value == "")item_id.classList.add("empty_inp");
    else item_id.classList.remove("empty_inp");

    if(quantity.value == "")quantity.classList.add("empty_inp");
    else quantity.classList.remove("empty_inp");

    if(item_id.value == "" || quantity.value == "")return;

    let body = {
        'item_id': item_id.value,
        'quantity': quantity.value
    }

    fetch("/add-quantity", {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(body)
    })
    .then(response => response.json())
    .then( data => {
        if(data.status == 10)adding_quantity_successful();
        else if(data.status == 11)adding_quantity_item_not_found();
        else adding_quantity_failed();
    });
}

function load_rem_item(){
    setActive("inv-rem-btn");
}