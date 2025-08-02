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


import {user_API} from './apis.js';
const token = localStorage.getItem("token")
const userRole = localStorage.getItem("User_role");
const id = localStorage.getItem("User_id")
async function all_data_load_dashboard(){
    let totalLeaves = document.getElementById('totalLeaves')
    let leavesTaken = document.getElementById('leavesTaken')
    let leavesAbsent = document.getElementById('leavesAbsent')
    let pendingRequests = document.getElementById('pendingRequests')
    let workingDays = document.getElementById('workingDays')
    let unplannedLeaves = document.getElementById('unplannedLeaves')
    if(userRole == "Employee"){
    try{
        const response = await fetch(`${user_API}/get/${id}`,{
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${token}`,
                'Content-Type':'application/json'
            }
        });
        
        let res = await response.json();
        console.log(res);
        totalLeaves.innerText = res.leave[0].totalLeaves
        leavesTaken.innerText = res.leave[0].leavesTaken
        leavesAbsent.innerText = res.leave[0].leavesAbsent
        pendingRequests.innerText = res.leave[0].pendingRequests
        workingDays.innerText = res.leave[0].workingDays
        unplannedLeaves.innerText = res.leave[0].unplannedLeaves
    }catch(error){
        console.log(error);
    }
}
else{
    console.log('Employee is not Logged In')
}
}
document.addEventListener('DOMContentLoaded',all_data_load_dashboard);



