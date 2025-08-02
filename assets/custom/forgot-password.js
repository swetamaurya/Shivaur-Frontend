// if(!localStorage.getItem("token")) {
//   window.location.href = 'index.html';
// }


 import {  user_API } from './apis.js';

 
 const forgetPassword = document.getElementById("forgetPassword");
 forgetPassword.addEventListener("submit", async (event) => {
   event.preventDefault();
   
   const email = document.getElementById("email").value;
    
   try {
     const response = await fetch(
       `${user_API}/sendResetOtp`,
       {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
          },
          body: JSON.stringify({ email}),
        }
      );
      const result = await response.json();
      
      if (response.ok) {
        localStorage.setItem('email',email)
        window.location.href='otp.html'
        document.getElementById("response").innerText= result.error || "Failed to send OTP.";
        
      }  
    } catch (error) {
    document.getElementById("response").innerText =
      "Error connecting to the server.";
    console.error("Error:", error);
  }
}); 