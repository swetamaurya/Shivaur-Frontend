// Import API configuration
const user_API = 'https://shivaur-backend.onrender.com/user';

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${user_API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.clear();
            const roles = result?.user?.roles;
            const userId = result?.user?.id;
            const name  = result?.user?.name;
            document.getElementById('response').innerText = result?.message;

            localStorage.setItem("token", result?.token);
            localStorage.setItem("User_id", userId);
            localStorage.setItem("User_role", roles);
            localStorage.setItem("User_name",name);
            localStorage.setItem('timestampActiveSession', Date.now().toString());

            // Redirect based on roles
            if (roles.toLowerCase() === "Admin".toLowerCase()) {
                window.location.href = 'admin-dashboard.html';
            } else if (roles.toLowerCase() === "Employee".toLowerCase()) {
                window.location.href = 'employee-dashboard.html';
            } else if (roles.toLowerCase() == "HR".toLowerCase()) {
                window.location.href = 'hr-dashboard.html';
            } else if (roles.toLowerCase() == "Manager".toLowerCase()) {
                window.location.href = 'manager-dashboard.html';
            } else {
                document.getElementById("response").innerHTML = `<i class="fa fa-times" aria-hidden="true"></i> Role not recognized.`;  
                localStorage.clear();
            }
        } else {
            document.getElementById("response").innerHTML = `<i class="fa fa-times" aria-hidden="true"></i> ${result?.message || "Login failed."}.`;
            localStorage.clear();
        }
    } catch (error) {
        document.getElementById("response").innerHTML = `<i class="fa fa-times" aria-hidden="true"></i> Server Down, please try again later..`;
        localStorage.clear();
    }
});



// window.togglePasswordOnClick =  function togglePasswordOnClick(){
//     let password = document.getElementById('password');
//     let togglePassword = document.getElementById('toggle-password')
//     let passwordValue = password.attributes[1].value
//     if(passwordValue == "password"){
//         password.attributes[1].textContent = 'text';
//         togglePassword.attributes[1].textContent = 'fa-solid fa-eye'
//     }
//     else{
//         password.attributes[1].textContent = 'password';
//         togglePassword.attributes[1].textContent = 'fa-solid fa-eye-slash'
//     }
// }