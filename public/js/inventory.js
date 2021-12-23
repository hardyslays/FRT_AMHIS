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
        if(data.status != 0){
            setActive("inv-list-btn");

            make_inv_table(data.body);
        }
    });
}

function load_add_item(){
    setActive("inv-add-btn");
}

function load_rem_item(){
    setActive("inv-rem-btn");
}