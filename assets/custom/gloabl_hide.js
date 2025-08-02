
export function main_hidder_function(){
    let role_of_user = localStorage.getItem("User_role");

    if(role_of_user.toLowerCase() == "HR".toLocaleLowerCase()){
        hr_restriction();
    } else if(role_of_user.toLowerCase() == "Manager".toLocaleLowerCase()){
        manager_restriction();
    } else if(role_of_user.toLowerCase() == "Employee".toLocaleLowerCase()){
        employee_restriction();
    }
}


// copy and paste hr class, to hide other functionalty for hr;
function hr_restriction(){
    let all = Array.from(document.querySelectorAll(".hr_restriction"));
    all.map((e)=>{
        e.style.display = 'none';
        e.classList.add("d-none");
    });
}

// copy and paste manager class, to hide other functionalty for manager;
function manager_restriction(){
    let all = Array.from(document.querySelectorAll(".manager_restriction"));
    all.map((e)=>{
        e.style.display = 'none';
        e.classList.add("d-none");
    });
}


// copy and paste employee class, to hide other functionalty for employee;
function employee_restriction(){
    let all = Array.from(document.querySelectorAll(".employee_restriction"));
    all.map((e)=>{
        e.style.display = 'none';
        e.classList.add("d-none");
    });
}