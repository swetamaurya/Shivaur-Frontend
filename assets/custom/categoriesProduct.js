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
// =================================================================================
import { checkbox_function } from './multi_checkbox.js';
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { capitalizeFirstLetter } from './globalFunctions2.js'
import { product_API } from './apis.js';
// -------------------------------------------------------------------------
import {individual_delete, objects_data_handler_function} from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';

// -------------------------------------------------------------------------
import {} from "./globalFunctionsExport.js";
// =================================================================================
import { global_search_API } from './apis.js'; // Define your global search API URL

const token = localStorage.getItem('token');
// =================================================================================

 // Function to handle search and update the same table
async function handleSearch() {
  const searchFields = ["category"]; // IDs of input fields
  const searchType = "category"; // Type to pass to the backend
  const tableData = document.getElementById("categoriesData");
  let tableContent = ""; // Initialize table content

  try {
    loading_shimmer();

    // Construct query parameters for the search
    const queryParams = new URLSearchParams({ type: searchType });
    searchFields.forEach((field) => {
      const value = document.getElementById(field)?.value;
      if (value) queryParams.append(field, value);
    });

    // Fetch search results from the API
    const response = await fetch(`${global_search_API}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await response.json();

    if (response.ok && res.data && res.data.length > 0) {
      // Data exists, build table rows
      const categories = res.data;
      categories.forEach((category, index) => {
        tableContent += `
          <tr data-id="${category?._id}">
              <td><input type="checkbox" class="checkbox_child" value="${category?._id || '-'}"></td>
             
              <td>${category?.category || "-"}</td>
              <td class="text-end">
                  <div class="dropdown dropdown-action">
                  <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown">
                      <i class="material-icons">more_vert</i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-right">
                      <a class="dropdown-item" onclick="editCategory('${category?._id}', '${category?.category || '-'}')" data-bs-toggle="modal" data-bs-target="#edit_data">
                      <i class="fa fa-pencil m-r-5"></i> Edit
                      </a>
                      <a class="dropdown-item" onclick="deleteButtonFun('${category?._id}')" data-bs-toggle="modal" data-bs-target="#delete_data">
                          <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                      </a>
                  </div>
                  </div>
              </td>
          </tr>`;
      });
    } else {
      // No results found
      tableContent = `<tr><td colspan="4" class="text-center">No results found</td></tr>`;
    }
  } catch (error) {
    console.error("Error during search:", error);
    // Display an error message in the table
    tableContent = `<tr><td colspan="4" class="text-center">An error occurred during search</td></tr>`;
  } finally {
    // Update table content and remove loading shimmer
    tableData.innerHTML = tableContent;
    checkbox_function(); // Reinitialize checkboxes
    remove_loading_shimmer();
  }
}

// Event listener for search button
document.getElementById("searchButton").addEventListener("click", (e) => {
  e.preventDefault();
  handleSearch(); // Trigger search
});



// Function to load categories and display them in the table
async function all_data_load_dashboard() {

  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // ----------------------------------------------------------------------------------------------------
  
  const categoriesTable = document.getElementById("categoriesData");
  try {
      const response = await fetch(`${product_API}/categories/get${rtnPaginationParameters()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
      });
  
      const result = await response.json();
      console.log("lkdkld ;- ",result);
      setTotalDataCount(result?.totalCategories);
          
      if (response.ok) {
        let res = result?.categories; // Store fetched categories in the global `res` array
        let tableContent = "";
        res.forEach((category, index) => {
          tableContent += `
              <tr data-id="${category?._id}">
                  <td><input type="checkbox" class="checkbox_child" value="${category?._id || '-'}"></td>
           
              <td>${category?.category || "-"}</td>
              <td class="text-end">
                  <div class="dropdown dropdown-action">
                  <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown">
                      <i class="material-icons">more_vert</i>
                  </a>
                  <div class="dropdown-menu dropdown-menu-right">
                      <a class="dropdown-item" onclick="editCategory('${category?._id}', '${category?.category || '-'}')" data-bs-toggle="modal" data-bs-target="#edit_data">
                      <i class="fa fa-pencil m-r-5"></i> Edit
                      </a>
                      <a class="dropdown-item" onclick="deleteButtonFun('${category?._id}')" data-bs-toggle="modal" data-bs-target="#delete_data">
                          <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                      </a>
                  </div>
                  </div>
              </td>
              </tr>`;
        });

        categoriesTable.innerHTML = tableContent;
        checkbox_function();
      }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
  // ----------------------------------------------------------------------------------------------------
  try{
      remove_loading_shimmer();
  } catch(error){console.log(error)}
} 
// =======================================================================================
// =======================================================================================
// On page load, load employee data for the dashboard
window.onload = all_data_load_dashboard;
objects_data_handler_function(all_data_load_dashboard);

//////////////////////////////////////// categories ///////////////////////////////////////////


document.getElementById("addCategoryForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!validateCategoryForm("categories")) {
    return; // Stop form submission if validation fails
  }

  try {
    loading_shimmer();
  } catch (error) {
    console.log(error);
  }
  
  // ----------------------------------------------------------------------------------------------------
  const categoryField = document.getElementById("categories");
  const category = categoryField.value;

  try {
    const response = await fetch(`${product_API}/categories/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category }),
    });

    try {
      Array.from(document.querySelectorAll(".btn-close")).map(e => e.click());
    } catch (error) {
      console.log(error);
    }

    const result = await response.json();
    const c1 = response.ok;

    try {
      if (c1) {
        all_data_load_dashboard();
        // Clear the form input on success
        categoryField.value = ""; 
      }
      status_popup(((c1) ? "Category Created <br> Successfully!" : "Please try<br> again later"), c1);
    } catch (error) {
      status_popup("Please try <br> again later", false);
    }
  } catch (error) {
    status_popup("Please try <br> again later", false);
  }
  // ----------------------------------------------------------------------------------------------------
  try {
    remove_loading_shimmer();
  } catch (error) {
    console.log(error);
  }
});



window.editCategory = function editCategory(a, b) {
  document.getElementById("_id_hidden").value = a;
  document.getElementById("edit-categories").value = b;
}

// Handle edit category form submission
document.getElementById("editCategories").addEventListener("submit", async function (event) {
  event.preventDefault();
  
  if (!validateCategoryForm("edit-categories")) {
    return; // Stop form submission if validation fails
  }
  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // ----------------------------------------------------------------------------------------------------
  
  
  let _id = document.getElementById("_id_hidden").value;
  let category = document.getElementById("edit-categories").value;


  try {
    const response = await fetch(`${product_API}/categories/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category, _id }), // Ensure _id is included
    });
    try{
      Array.from(document.querySelectorAll(".btn-close")).map(e=>e.click());
    } catch(error){console.log(error);}

    const c1 = (response.ok);
    try{
        if(c1){
            all_data_load_dashboard();
        }
        status_popup( ((c1) ? "Category Updated <br> Successfully!" : "Please try <br> again later"), (c1) );
    } catch (error){
      status_popup("Please try <br> again later", false);
    }
  } catch (error) {
    status_popup("Please try <br> again later", false);
  }
  // ----------------------------------------------------------------------------------------------------
  try{
      remove_loading_shimmer();
  } catch(error){console.log(error)}
});

// ==========================================================
// ==========================================================
// ==========================================================
// ==========================================================
// ==========================================================

// Validation function for both forms
function validateCategoryForm(fieldId) {
  clearErrors(); // Clear previous error messages

  const categoryField = document.getElementById(fieldId);

  if (!categoryField.value.trim()) {
    showError(categoryField, "Category name is required");
    return false;
  }

  if (categoryField.value.trim().length < 3) {
    showError(categoryField, "Category name must be at least 3 characters");
    return false;
  }

  return true;
}

// --------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------
// Function to show error messages inside the correct div next to labels
// --------------------------------------------------------------------------------------------------
function showError(element, message) {
  const errorContainer = element.previousElementSibling; // Access the div with label
  let errorElement = errorContainer.querySelector('.text-danger.text-size');
  
  if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'text-danger text-size mohit_error_js_dynamic_validation';
      errorElement.style.fontSize = '10px';
      errorElement.innerHTML = `<i class="fa-solid fa-times"></i> ${message}`;
      errorContainer.appendChild(errorElement);
  } else {
      errorElement.innerHTML = `<i class="fa-solid fa-times"></i> ${message}`;
  }
}
// --------------------------------------------------------------------------------------------------
// Function to clear all error messages
// --------------------------------------------------------------------------------------------------
function clearErrors() {
  const errorMessages = document.querySelectorAll('.text-danger.text-size.mohit_error_js_dynamic_validation');
  errorMessages.forEach((msg) => msg.remove());
}
