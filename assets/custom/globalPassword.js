function togglePasswordOnClick(passwordId,togglePasswordId){
    let password = document.getElementById(passwordId);
    let togglePassword = document.getElementById(togglePasswordId)
    
    let passwordValue = password.attributes[1].value
    if(passwordValue == "password"){
        password.attributes[1].textContent = 'text';
        if(togglePassword.classList.contains('fa-eye-slash')){
            togglePassword.classList.replace("fa-eye-slash","fa-eye");
        }
    }
    else{
        password.attributes[1].textContent = 'password';
        if(togglePassword.classList.contains('fa-eye')){
            togglePassword.classList.replace("fa-eye","fa-eye-slash");
        }
    }
}