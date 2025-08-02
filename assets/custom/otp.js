import {  user_API } from './apis.js';

const addOtpForm = document.getElementById("add-otp-form");
// addOtpForm.addEventListener("submit",(event)=>{
//     event.preventDefault();
     
//  })
let email = localStorage.getItem('email');

 addOtpForm.addEventListener("submit", async (event) => {
   event.preventDefault();
   const input1 = document.getElementById('input1').value
    const input2 = document.getElementById('input2').value
    const input3 = document.getElementById('input3').value
    const input4 = document.getElementById('input4').value
    const currentOtp = input1+input2+input3+input4
    
   try {
     const response = await fetch(
       `${user_API}/verifyOtp`,
       {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
          },
          body: JSON.stringify({ email,currentOtp }),
        }
      );
      const result = await response.json();
      
      if (response.ok) {
        localStorage.setItem('otp',currentOtp)
        window.location.href='new-password.html'
        // document.getElementById("response").innerText= result.error || "Failed to send OTP.";
        
      }  
    } catch (error) {
    // document.getElementById("response").innerText =
    //   "Error connecting to the server.";
    console.error("Error:", error);
  }
});