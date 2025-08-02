(function(){
  const timestamp = localStorage.getItem('timestampActiveSession');
  if (timestamp) {
      const currentTime = Date.now();
      const timeDiff = currentTime - parseInt(timestamp);
      let hrs = 9.5; // hrs session active condition
      if (timeDiff > hrs * 60 * 60 * 1000) {
          localStorage.clear();
          window.location.href = 'index.html';
      }
  } else {
      localStorage.clear();
      window.location.href = 'index.html';
  }
})();

//  const user_API = 'http://localhost:6000/user';
 const token = localStorage.getItem('token');
 import {user_API} from './apis.js';
 import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';

 if (window.location.pathname.toLowerCase().includes('register')) {
  const registerForm = document.getElementById('postForm');
  
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get input values
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

      const result = await response.json();

      if (response.ok) {
        document.getElementById('response').innerText = result.message;
        window.location.href = 'index.html';
      } else {
        document.getElementById('response').innerText = result.message || 'Registration failed.';
      }
    } catch (error) {
      document.getElementById('response').innerText = 'Error connecting to the server.';
      console.error('Error:', error);
    }
  });
}

 
// Handle Login
if (window.location.pathname.toLowerCase().includes(('index').toLowerCase())) {
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
              const roles = result.user.roles;
              const userId = result.user.id;
              const name  = result.user.name;
              document.getElementById('response').innerText = result.message;

              // Store token and user details in localStorage
              localStorage.setItem("token", result.token);
              localStorage.setItem("User_id", userId);  // Store the user ID
              localStorage.setItem("User_role", roles);  // Store the user role
              localStorage.setItem("User_name",name);

              // Redirect based on roles
              // if (roles === "Admin") {
              //     window.location.href = 'admin-dashboard.html';
              // } else if (roles === "Employee") {
              //     window.location.href = 'employee-dashboard.html';
              //   } else if (roles === "Supervisor") {
              //     window.location.href = 'supervisor-dashboard.html';
              
              // } else if (roles === "Client") {
              //     window.location.href = 'clients-list.html';
              // } else {
              //     document.getElementById("response").innerText = "Role not recognized.";
              // }
          } else {
              document.getElementById("response").innerText = result.message || "Login failed.";
          }
      } catch (error) {
          document.getElementById("response").innerText = "Error connecting to the server.";
          console.error("Error:", error);
      }
  });
}
 

// Show on roles details
if (window.location.pathname.toLowerCase().includes('profile')) {
  async function all_data_load_dashboard() {
    const userId = localStorage.getItem('User_id'); // Get logged-in user ID
    const token = localStorage.getItem('token'); // Get token for authorization

    try {
      const response = await fetch(`${user_API}/roles/get`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      console.log('API Response:', res);

      // Find the user by userId
      const user = res.role?.find(users => users._id === userId);

      if (user) {
        // Display user data in the profile
        document.getElementById('file-display').src = user.image || '-';
        document.getElementById('name').textContent = user.name || '-';
        document.getElementById('email').textContent = user.email || '-';
        document.getElementById('mobile').textContent = user.mobile || '-';
        document.getElementById('role').textContent = user.roles || '-';
        document.getElementById('DOB').textContent = user.DOB || '-';
        document.getElementById('address').textContent = user.address || '-';
        document.getElementById('gender').textContent = user.gender || '-';

        // Populate the form with existing values
        document.getElementById('update-name').value = user.name || '';
        document.getElementById('update-mobile').value = user.mobile || '';
        document.getElementById('update-DOB').value = user.DOB || '';
        document.getElementById('update-address').value = user.address || '';

        // Handle gender population
        const genderInput = document.querySelector(`input[name="gender"][value="${user.gender}"]`);
        if (genderInput) {
          genderInput.checked = true;
        }
      } else {
        console.log('User not found for the logged-in ID');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      try {
        remove_loading_shimmer(); // Remove shimmer after completion
      } catch (error) {
        console.error('Error removing shimmer:', error);
      }
    }
  }

  // Event Listener for Profile Update Form Submission
  const rolesUpdateForm = document.getElementById('profile-update-form');
  rolesUpdateForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userId = localStorage.getItem('User_id'); // Ensure userId is available
    if (!userId) {
      alert('User ID not found');
      return;
    }

    try {
      loading_shimmer();

      // Create FormData object for sending data (including files)
      const formData = new FormData();
      formData.append('_id', userId);
      formData.append('name', document.getElementById('update-name').value);
      formData.append('mobile', document.getElementById('update-mobile').value);
      formData.append('DOB', document.getElementById('update-DOB').value);
      formData.append('gender', document.querySelector('input[name="gender"]:checked').value);
      formData.append('address', document.getElementById('update-address').value);

      // Check if a file is selected for upload
      const fileInput = document.getElementById('update-file');
      if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        formData.append('image', file); // Append file to FormData
      }

      // Send updated data to backend
      const response = await fetch(`${user_API}/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Send token for authentication
        },
        body: formData, // Send form data
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const success = response.ok;

      status_popup(success ? "Profile Updated <br> Successfully!" : "Please try <br> again later", success);

      if (success) {
        await all_data_load_dashboard(); // Reload data on successful update
      }
    } catch (error) {
      console.error('Error updating roles:', error);
      status_popup("Please try <br> again later", false);
    } finally {
      try {
        remove_loading_shimmer(); // Ensure shimmer is removed
      } catch (error) {
        console.error('Error removing shimmer:', error);
      }
    }
  });

  // Initial Data Load
  try {
    loading_shimmer();
    await all_data_load_dashboard();
  } catch (error) {
    console.error('Error during initial load:', error);
  } finally {
    try {
      remove_loading_shimmer();
    } catch (error) {
      console.error('Error removing shimmer on initial load:', error);
    }
  }
}




// forget password
if (window.location.pathname.toLowerCase().includes('forgot-password')) {
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
      window.location.href='otp.html'
      document.getElementById("response").innerText= result.error || "Failed to send OTP.";
     
    }  
  } catch (error) {
    document.getElementById("response").innerText =
      "Error connecting to the server.";
    console.error("Error:", error);
  }
}); 
}

// window.onload = all_data_load_dashboard();







