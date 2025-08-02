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

const token = localStorage.getItem("token");
import {status_popup} from './globalFunctions1.js';
import {departments_API , policy_API} from './apis.js';

try {
    const response = await fetch(`${departments_API}/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const res = await response.json();
    console.log(res);
  
const department = document.getElementById("department_select_option");
res?.data.forEach((departments) => {
    const option = document.createElement("option");
    option.value = departments._id;
    option.text = `${departments?.departments}`;
    department.appendChild(option);
  });
}
catch(error){
    console.error('Error fetching data:', error);
  // alert('Failed to load client and employee data.');
}

const addPolicyForm = document.getElementById("add-policy-form")
addPolicyForm.addEventListener("submit", async function (event) {
    event.preventDefault();
  
    try {
      const description = document.querySelector('.note-editable').childNodes[0].textContent

        const policyName = document.getElementById("policy-name").value
        // const description = document.getElementById("summernote").innerText
        const date = document.getElementById("date").value
        const department = document.getElementById("department_select_option").value
      const formData = new FormData();
  
      // Append project files
      const files = document.getElementById("policy_upload").files;
      for (const file of files) {
        formData.append("file", file);
      }
  
      // Append form fields
      formData.append("policyName", policyName);
      formData.append("description", description);
      formData.append("department", department); 
      formData.append("date", date); 

      console.log("Form Data:", formData);
  
      // Send form data to server
      const response = await fetch(`${policy_API}/post`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const res = await response.json()
      console.log(res)
      const c1 = (response.ok==true);
      try{
          status_popup( ((c1) ? "Policy Created <br> Successfully!" : "Please try again later"), (c1) );
          setTimeout(function(){
              window.location.href = 'policies.html'; // Adjust this path if needed
          },(Number(document.getElementById("b1b1").innerText)*1000));
      } catch (error){
        status_popup( ("Please try again later"), (false) );
      }
    } catch (error) {
      status_popup( ("Please try again later"), (false) );
    }
  });