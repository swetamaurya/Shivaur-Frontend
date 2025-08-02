
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
const token = localStorage.getItem('token');
// =======================================================================================
import { r_arr1, u_arr1, disableBtns } from './multi_checkbox.js';
import { status_popup, loading_shimmer, remove_loading_shimmer } from './globalFunctions1.js';
import { delete_API } from './apis.js';
// ---------------------------------------------------------------------------------------
import { forGloablDelete_js, pagination_data_handler_function } from './globalFunctionPagination.js';
// =======================================================================================

// let table_data_reload;
export function objects_data_handler_function(table_data_function){
    pagination_data_handler_function(table_data_function);
    // table_data_reload = table_data_function;
}

const dbmf = document.getElementById("delete_btn_multiple_file");
dbmf.addEventListener('click', function(){
    deleteFunction();
});

export function individual_delete (_id) {
    u_arr1();
    document.querySelector(`[data-id='${_id}']`).querySelector('input[type="checkbox"]').checked = true;
    deleteFunction();
};

// Delete selected employees
let deleteVariable_globalFunction2;
function deleteFunction() {
    if(r_arr1().length<=0){
        return;
    }
    deleteVariable_globalFunction2 = document.getElementById("deleteButton")
    deleteVariable_globalFunction2.addEventListener("click",deleteEventFunction);
}

async function deleteEventFunction(event) {
    event.preventDefault();
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    try{
        deleteVariable_globalFunction2.removeEventListener("click",deleteEventFunction);
    } catch(error){console.log(error)}

    const selectedIds = r_arr1();
    if (selectedIds.length > 0) {
        try {
            const response = await fetch(`${delete_API}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ "_id": selectedIds }),
            });

            // ----------------------------------------------------------------------------------------------------
            try{
                u_arr1();
                disableBtns();
                remove_loading_shimmer();
            } catch(error){console.log(error)}
            // ----------------------------------------------------------------------------------------------------

            const success = response.ok;
            status_popup(success ? "Data Removed <br> Successfully!" : "Please try <br> again later", success);
            
            if (success){
                // table_data_reload();
                forGloablDelete_js();
            }
        } catch (error) {
            console.error("Error deleting data:", error);
            status_popup("Please try <br> again later", false);
        }
        // ----------------------------------------------------------------------------------------------------
        try{
            remove_loading_shimmer();
        } catch(error){console.log(error)}
    }
}