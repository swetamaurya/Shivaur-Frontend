
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
import { export_API } from './apis.js';
// =======================================================================================

console.log("attached broher")

const ebmf = document.getElementById("download_excel_multiple_file");
ebmf.addEventListener('click', function(){
    exportFunction();
});


// Delete selected employees
let exportVariable_globalFunction2;
function exportFunction() {
    if(r_arr1().length<=0){
        return;
    }
    exportVariable_globalFunction2 = document.getElementById("exportButton")
    exportVariable_globalFunction2.addEventListener("click",deleteEventFunction);
}

async function deleteEventFunction(event) {
    event.preventDefault();
    try{
        loading_shimmer();
    } catch(error){console.log(error)}
    try{
        exportVariable_globalFunction2.removeEventListener("click",deleteEventFunction);
    } catch(error){console.log(error)}
    // ----------------------------------------------------------------------------------------------------

    const selectedIds = r_arr1();
    if (selectedIds.length > 0) {
        try {
            const response = await fetch(`${export_API}`, {
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
            status_popup(success ? "Data Exported <br> Successfully!" : "Please try <br> again later", success);


            if (response.ok) {
                // Convert response to ArrayBuffer (if it's in bytes)
                const arrayBuffer = await response.arrayBuffer();
            
                // Create a Blob from the ArrayBuffer (with MIME type for XLSX)
                const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
                // Create a temporary download link
                const link = document.createElement('a');
                const url = window.URL.createObjectURL(blob);
                
                // Set the href of the link to the Blob URL
                link.href = url;
            
                // Set the filename for the download
                link.download = 'exported_file.xlsx';
            
                // Trigger the click event to download the file
                link.click();
            
                // Clean up the Blob URL after download
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Failed to fetch the file');
            }
            
        } catch (error) {
            console.error("Error deleting data:", error);
            status_popup("Please try <br> again later", false);
        }
    }
}