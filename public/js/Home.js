function clearActive(){
    document.getElementById("sidebar-option-1").classList.remove("active");
    document.getElementById("sidebar-option-2").classList.remove("active");
    document.getElementById("sidebar-option-3").classList.remove("active");
    document.getElementById("sidebar-option-4").classList.remove("active");
}

function select_sidebar_1(){
    let self_class = document.getElementById("sidebar-option-1").classList;
    console.log(self_class);

    if(self_class.contains("active") ){
        console.log("Already active");    
        return;
    }
    else {
        console.log("Activating sidebar 1");

        clearActive();

        document.getElementById("sidebar-option-1").classList.add("active");
    }
}

function select_sidebar_2(){
    let self_class = document.getElementById("sidebar-option-2").classList;
    console.log(self_class);

    if(self_class.contains("active") ){
        console.log("Already active");    
        return;
    }
    else {
        console.log("Activating sidebar 2");

        clearActive();
        
        document.getElementById("sidebar-option-2").classList.add("active");
    }
}

function select_sidebar_3(){
    let self_class = document.getElementById("sidebar-option-3").classList;
    console.log(self_class);

    if(self_class.contains("active") ){
        console.log("Already active");    
        return;
    }
    else {
        console.log("Activating sidebar 3");
    
        clearActive();
        
        document.getElementById("sidebar-option-3").classList.add("active");
    }
}

function select_sidebar_4(){
    let self_class = document.getElementById("sidebar-option-4").classList;
    console.log(self_class);

    if(self_class.contains("active") ){
        console.log("Already active");    
        return;
    }
    else {
        console.log("Activating sidebar 4");
    
        clearActive();
        
        document.getElementById("sidebar-option-4").classList.add("active");
    }
}