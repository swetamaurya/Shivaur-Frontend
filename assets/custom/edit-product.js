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
import {status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import {product_API , vendor_API} from './apis.js';
// =================================================================================
const token = localStorage.getItem('token');
let id_param = new URLSearchParams(window.location.search).get("id");
// =======================================================
// =======================================================  
// =======================================================

// Vendor API 
try{
const vendorSelect = document.getElementById("vendor_select");  
// vendorSelect.innerHTML = '<option value="" disabled selected>Select Vendor</option>';

const response = await fetch(`${vendor_API}/getAll`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

if (!response.ok) {
  throw new Error("Failed to fetch vendor");
}

const vendor = await response.json();

console.log(vendor.data)

// Populate the dropdown with categories
vendor.data?.forEach(vendor => {
  const option = document.createElement("option");
  option.value = vendor._id; // Set category ID as the value
  option.textContent = vendor.vendorName; // Display category name
  vendorSelect.appendChild(option);
});
} catch (error) {
console.error("Error loading vendor:", error);
// alert("Could not load vendor. Please try again.");
}

async function editDateLoad() {
  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------

  try{
    const response = await fetch(`${product_API}/get/${id_param}`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if(!response.ok){
      throw new Error();
    }
    let r2 = await response.json();
    console.log("broror :-- ",r2)

    let a1 = document.getElementById("material");
    let a2 = document.getElementById("category_select");
    let a3 = document.getElementById("price");
    let a4 = document.getElementById("status");
    let a5 = document.getElementById("quantity");
    let a6 = document.getElementById("vendor_select");
    let a7 = document.getElementById("purchaseDate");
    let a8 = document.getElementById("description");
    let a9 = document.getElementById("unit");
    let a10 = document.getElementById("totalPrice");

    a1.value = r2?.material;
    a2.value = r2?.category?._id;
    a3.value = r2?.price;
    a4.value = r2?.status;
    a5.value = r2?.quantity;
    a6.value = r2?.vendor?._id;
    a7.value = r2?.purchaseDate;
    a8.value = r2?.description;
    a9.value = r2?.unit;
    a10.value = r2?.totalPrice;
    
    let rd_doc = r2?.images;
    if(rd_doc.length!=0){
      let uploaded_files = document.getElementById("uploaded_files");
      uploaded_files.classList.remove("d-none");

      let uploaded_files_tbodyone = document.getElementById("uploaded_files_tbodyone");
      rd_doc.map((ee,i)=>{
        // console.log("aldsjfas :0 ",ee)
        let rowNew = document.createElement("tr");
        rowNew.innerHTML = `
                            <td>${i+1}</td>
                            <td>
                                <input class="form-control" type="name" value="File ${i+1}" disabled id="paymentDate">
                            </td>
                            <td class="text-center">
                              <a href="${ee}" target="_blank" class="btn btn-primary "><i class="fa-solid fa-eye"></i></a>
                            </td>`;
        uploaded_files_tbodyone.appendChild(rowNew);
      })
    }else {
      document.getElementById("uploaded_files").classList.add("d-none");
    }
  } catch(error){
    // window.location.href = 'product-list.html';
    console.log('the error is ',error);
  }
  // ----------------------------------------------------------------------------------------------------
  try{
    remove_loading_shimmer();
  } catch(error){console.log(error)}

    
}


try {
  // Fetch categories from the API
  const categorySelect = document.getElementById("category_select");  
  categorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';

  const response = await fetch(`${product_API}/categories/get`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const categories = await response.json();

  // Populate the dropdown with categories
  categories?.categories?.forEach(category => {
    const option = document.createElement("option");
    option.value = category._id; // Set category ID as the value
    option.textContent = category.category; // Display category name
    categorySelect.appendChild(option);
  });
} catch (error) {
  console.error("Error loading categories:", error);
}
editDateLoad();



// Handle Add Product form submission - Ensure this event listener is added only once
const submitButton = document.getElementById("submitProduct");
submitButton.addEventListener("click",add_pro_fun);
async function add_pro_fun (event){
  event.preventDefault();
  if (!validateProductForm()) {
    return; // Stop form submission if validation fails
  }
  try{
      loading_shimmer();
  } catch(error){console.log(error)}
  // -----------------------------------------------------------------------------------
  submitButton.removeEventListener('click',add_pro_fun);

  const formData = new FormData();
  formData.append("_id",id_param);
  formData.append("material", document.getElementById("material")?.value);
  formData.append("category", document.getElementById("category_select")?.value);
  formData.append("price", document.getElementById("price")?.value);
  formData.append("totalPrice", document.getElementById("totalPrice")?.value);
  formData.append("status", document.getElementById("status")?.value);
  formData.append("unit", document.getElementById("unit")?.value);

  formData.append("quantity", document.getElementById("quantity")?.value);
  formData.append("vendor", document.getElementById("vendor_select")?.value);
  formData.append("description", document.getElementById("description")?.value);
  formData.append("purchaseDate", document.getElementById("purchaseDate")?.value);

  const files = document.getElementById("product-file")?.files;
  if (files) {
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }
  }

  try { 
    const response = await fetch(`${product_API}/update`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    
    const c1 = (response.ok);
    try{
        status_popup( ((c1) ? "Material Updated <br> Successfully!" : "Please try <br> again later"), (c1) );
        setTimeout(function(){
          window.location.href = 'product-list.html';
        },(Number(document.getElementById("b1b1").innerText)*1000));
    } catch (error){
      status_popup( ("Please try <br> again later"), (false) );
    }
  } catch (error) {
    console.error("Error:", error);
  }
  // ----------------------------------------------------------------------------------------------------
  try{
      remove_loading_shimmer();
  } catch(error){console.log(error)}
}


// =======================================================================================
// =======================================================================================
let dd1 = document.getElementById("price");
let dd2 = document.getElementById("quantity");

dd1.addEventListener("input", priceQuantityTotalPrice);
dd2.addEventListener("input", priceQuantityTotalPrice);

function priceQuantityTotalPrice(){
  let aaa1 = Number(dd1.value);
  let aaa2 = Number(dd2.value);

  document.getElementById("totalPrice").value = `${aaa1*aaa2}`;
}
// =======================================================================================
// =======================================================================================

// Validation function for add product form
function validateProductForm() {
  clearErrors(); // Clear previous error messages

  let isValid = true;

  // Get field elements
  const material = document.getElementById("material");
  const category = document.getElementById("category_select");
  const price = document.getElementById("price");
  const status = document.getElementById("status");
  const unit = document.getElementById("unit");

  const quantity = document.getElementById("quantity");
  const vendor = document.getElementById("vendor_select");
  const purchaseDate = document.getElementById("purchaseDate");
  const description = document.getElementById("description");

  // Validate required fields
  if (!material.value.trim()) {
    showError(material, "Please enter a valid product name");
    isValid = false;
  }

  if (!category.value.trim()) {
    showError(category, "Please select a category");
    isValid = false;
  }

  if (!unit.value.trim()) {
    showError(unit, "Please enter a valid unit");
    isValid = false;
  }
  if (price.value.trim() === "" || parseFloat(price.value) < 0) {
    showError(price, "Please enter a valid price");
    isValid = false;
  }

  if (!status.value.trim()) {
    showError(status, "Please select a status");
    isValid = false;
  }

  if (quantity.value.trim() === "" || parseInt(quantity.value) < 0) {
    showError(quantity, "Please enter a valid stock quantity");
    isValid = false;
  }
  // if (!unit.value.trim()) {
  //   showError(unit, "Please enter valid a unit");
  //   isValid = false;
  // }

  if (!vendor.value.trim()) {
    showError(vendor, "Please enter a vendor name");
    isValid = false;
  }

  if (!purchaseDate.value.trim()) {
    showError(purchaseDate, "Please select a purchase date");
    isValid = false;
  }

  if (!description.value.trim()) {
    showError(description, "Please provide a product description");
    isValid = false;
  }

  return isValid;
}
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
