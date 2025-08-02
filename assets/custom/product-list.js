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
import { loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
import { product_API } from './apis.js';
// -------------------------------------------------------------------------
import {individual_delete, objects_data_handler_function} from './globalFunctionsDelete.js';
window.individual_delete = individual_delete;
import { global_search_API } from './apis.js'; // Define your global search API URL
// -------------------------------------------------------------------------
import {main_hidder_function} from './gloabl_hide.js';
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';
import {} from "./globalFunctionsExport.js";
// =================================================================================
const token = localStorage.getItem('token');
// =================================================================================


async function handleSearch() {
  const searchFields = ["material", "vendor"]; // IDs of input fields
  const searchType = "product"; // Type to pass to the backend
  const productTable = document.getElementById("productData"); // Product table body
  let tableContent = ''; // Initialize table content

  try {
    loading_shimmer(); // Display shimmer during loading

    // Build query parameters
    const queryParams = new URLSearchParams({ type: searchType });
    searchFields.forEach((field) => {
      const value = document.getElementById(field)?.value?.trim();
      if (value) queryParams.append(field, value);
    });

    // Fetch search results from the API
    const response = await fetch(`${global_search_API}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const res = await response.json();

    // Check if products are returned in the response
    if (res.data?.length > 0) {
      const products = res.data;
      // Loop through products to populate table rows
      for (let i = 0; i < products.length; i++) {
        tableContent += `
          <tr data-id="${products[i]?._id}">
            <td><input type="checkbox" class="checkbox_child" value="${products[i]?._id || '-'}"></td>
            <td>${capitalizeFirstLetter(products[i]?.material) || "-"} (${products[i]?.productId || '-'})</td>
            <td>${capitalizeFirstLetter(products[i]?.category?.category) || "-"}</td>
            <td>${capitalizeFirstLetter(products[i]?.vendor?.vendorName) || "-"}</td>
            <td>${formatDate(products[i]?.purchaseDate) || "-"}</td>
            <td>₹ ${products[i]?.price || "-"}</td>
            <td>${products[i]?.quantity || "-"}</td>
            <td>${capitalizeFirstLetter(products[i]?.status) || "-"}</td>
            <td class="text-end">
              <div class="dropdown dropdown-action">
                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="material-icons">more_vert</i>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  <a href="product-view.html?id=${products[i]?._id}" class="dropdown-item"><i class="fa-regular fa-eye"></i> View</a>
                  <a href="edit-product.html?id=${products[i]?._id}" class="dropdown-item  "><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                  <a class="dropdown-item " onclick="individual_delete('${products[i]?._id}')" data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                </div>
              </div>
            </td>
          </tr>`;
      }
      // hr_restriction employee_restriction
    } else {
      // If no products are found, display a "No results found" message
      tableContent = `<tr><td colspan="9" class="text-center">No results found</td></tr>`;
    }
  } catch (error) {
    console.error("Error during search:", error);
    tableContent = `<tr><td colspan="9" class="text-center">An error occurred during search</td></tr>`;
  } finally {
    // Update the product table and reinitialize checkboxes
    productTable.innerHTML = tableContent;
    checkbox_function(); // Reinitialize checkboxes
    remove_loading_shimmer(); // Remove shimmer
  }
  try{
      main_hidder_function();
  } catch (error){console.log(error)}
  
}

// Attach the search function to the search button
document.getElementById("searchButton").addEventListener("click", (e) => {
  e.preventDefault();
  handleSearch(); // Trigger search on button click
});

// =================================================================================
// =================================================================================


// Load products only once on page load
async function all_data_load_dashboard() {
  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------
  const productTable = document.getElementById("productData");

  if (!productTable) {
    console.error("Element with ID 'productData' not found.");
    return;
  }

  try {
    const r1 = await fetch(`${product_API}/get${rtnPaginationParameters()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Check if response is OK
    if (!r1.ok) throw new Error(`Error fetching data: ${r1.statusText}`);

    // Parse JSON response only once
    const p1 = await r1.json();
    setTotalDataCount(p1?.totalProducts);
    
    const products = p1?.data || [];

    console.log(products)


    let tableContent = "";
    if(products.length>0){
      for(let i = 0; i<products.length; i++){
        tableContent += `
          <tr data-id="${products[i]?._id}">
            <td><input type="checkbox" class="checkbox_child" value="${products[i]?._id || '-'}"></td>
            <td>${capitalizeFirstLetter(products[i]?.material) || "-"} (${products[i]?.productId || '-'})</td>
            <td>${capitalizeFirstLetter(products[i]?.category?.category) || "-"}</td>
            <td>${capitalizeFirstLetter(products[i]?.vendor?.vendorName) || "-"}</td>
            <td>${formatDate(products[i]?.purchaseDate) || "-"}</td>
            <td>₹ ${products[i]?.price || "-"}</td>
            <td>${products[i]?.quantity || "-"}</td>
            <td>${capitalizeFirstLetter(products[i]?.status) || "-"}</td>
            <td class="text-end">
              <div class="dropdown dropdown-action">
                <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="material-icons">more_vert</i>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                  <a href="product-view.html?id=${products[i]?._id}" class="dropdown-item" ><i class="fa-regular fa-eye"></i> View</a>
                  <a href="edit-product.html?id=${products[i]?._id}" class="dropdown-item "><i class="fa-solid fa-pencil m-r-5"></i> Edit</a>
                  <a class="dropdown-item " onclick="individual_delete('${products[i]?._id}')"  data-bs-toggle="modal" data-bs-target="#delete_data"><i class="fa-regular fa-trash-can m-r-5"></i> Delete</a>
                </div>
              </div>
            </td>
          </tr>`;
      }
      productTable.innerHTML = tableContent;
    }
  } catch (error) {
    console.error("Error loading products:", error);
  }
  checkbox_function();
  // ----------------------------------------------------------------------------------------------------
  try{
      remove_loading_shimmer();
  } catch(error){console.log(error)}
  try{
      main_hidder_function();
  } catch (error){console.log(error)}
  
}



// ==========================================================================================
// On page load, load employee data for the dashboard
window.onload = all_data_load_dashboard;
objects_data_handler_function(all_data_load_dashboard);
