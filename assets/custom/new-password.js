import {user_API} from './apis.js';

let email = localStorage.getItem('email')
let currentOtp = localStorage.getItem('otp')
const addPasswordForm = document.getElementById("add-password-form");
addPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const newPassword = document.getElementById("confirm-password").value;

    try {
        const response = await fetch(`${user_API}/resetPassword`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, newPassword, currentOtp })
        });
          const result = await response.json();
          console.log('This is my result: ', result);
            if (response.ok) {
                localStorage.clear();
                window.location.href = 'index.html';
            } else {
                console.log('Error:', result.message);
                alert(result.message);
            }
    } catch (error) {
        console.log(error);
    }
});



