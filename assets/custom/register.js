import {status_popup} from './globalFunctions1.js';
import {user_API} from './apis.js';

const token = localStorage.getItem('token');

// =======================================================
// =======================================================
// =======================================================

const registerForm = document.getElementById('postForm');

// Form submit event listener
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Get form values after validation passes
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const mobile = document.getElementById('mobile').value;
  const password = document.getElementById('password').value;
  const roles = document.getElementById('role').value;

  try {
    // Send data to the backend
    const response = await fetch(`${user_API}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, mobile, password, roles }),
    });


    const c1 = (response.ok);
    try{
        status_popup( ((c1) ? "Account Created <br> Successfully!" : "Please try again later"), (c1) );
        setTimeout(function(){
          window.location.href = 'index.html';
        },((Number(document.getElementById("b1b1").innerText)-1)*1000));
    } catch (error){
      status_popup( ("Please try again later"), (false) );
    }
  } catch (error) {
    status_popup( ("Please try again later"), (false) );
    // document.getElementById('response').innerText = 'Error connecting to the server.';
    console.error('Error:', error);
  }
});