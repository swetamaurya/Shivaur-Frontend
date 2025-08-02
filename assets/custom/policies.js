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
import { policy_API } from "./apis.js";
import { loading_shimmer, remove_loading_shimmer } from "./globalFunctions1.js";
import { checkbox_function } from "./multi_checkbox.js";
import { formatDate, capitalizeFirstLetter } from './globalFunctions2.js'
// =================================================================================
import { individual_delete, objects_data_handler_function} from "./globalFunctionsDelete.js";
window.individual_delete = individual_delete;
// -------------------------------------------------------------------------
import {main_hidder_function} from './gloabl_hide.js';
// ------------------------------------------------------------------------------------
import {rtnPaginationParameters, setTotalDataCount} from './globalFunctionPagination.js';
// =================================================================================
const token = localStorage.getItem("token");
// get API for Estimate start

// var res;
async function all_data_load_dashboard() {
  try {
    loading_shimmer();
  } catch (error) {
    console.log(error);
  }
  // ----------------------------------------------------------------------------------------------------

  let policyTableData = document.getElementById("policyTableData");
  const response = await fetch(`${policy_API}/all${rtnPaginationParameters()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  let r2 = await response.json();
  let res = r2?.data;
  console.log(res);
  setTotalDataCount(r2?.totalPolicies);


  var x = "";
  for (var i = 0; i < res.length; i++) {
    var e = res[i];
    x += `<tr data-id="${e._id}">
            <td class="width-thirty"><input type="checkbox" class="checkbox_child" value="${
              e?._id || "-"
            }"></td>
                    <td>${i + 1}</td>
                    <td>${e.policyName}</td>
                    <td>${e.department?.departments}</td>
                    <td>${formatDate(e.date)}</td>
                    <td class="text-end">
                      <div class="dropdown dropdown-action">
                        <a href="#" class="action-icon dropdown-toggle" data-bs-toggle="dropdown"
                          aria-expanded="false"><i class="material-icons">more_vert</i></a>
                        <div class="dropdown-menu dropdown-menu-right">
                          <a class="dropdown-item" href="policy-view.html?id=${
                            e._id
                          }">
                          <i class="fa-solid fa-eye m-r-5"></i> View</a>
                          <a class="dropdown-item employee_restriction" href="edit-policy.html?id=${
                            e._id
                          }">
                          <i class="fa-solid fa-pencil m-r-5"></i>
                            Edit</a>
                              <a class="dropdown-item employee_restriction" onclick="individual_delete('${
                                e?._id
                              }')" data-bs-toggle="modal" data-bs-target="#delete_data">
                            <i class="fa-regular fa-trash-can m-r-5"></i> Delete
                        </a>
                        </div>
                      </div>
                    </td>
                  </tr>`;
  }
  policyTableData.innerHTML = x;
  checkbox_function();

  // ----------------------------------------------------------------------------------------------------
  try {
    remove_loading_shimmer();
  } catch (error) {
    console.log(error);
  }
  try{
      main_hidder_function();
  } catch (error){console.log(error)}
}

// On page load, load employee data for the dashboard
all_data_load_dashboard();
objects_data_handler_function(all_data_load_dashboard);
