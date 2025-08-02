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

let userId = localStorage.getItem('User_id');
let User_role = localStorage.getItem('User_role')
if (User_role == 'Employee') {
    let profile = document.getElementById('profile');
    if (profile) {
        let profilePage = profile.getAttribute('href');
        if (profilePage == 'profile.html') {
            profile.setAttribute('href', 'userP.html');
        } else {
            console.log('Href is not found');
        }
    } else {
        console.log('Profile element not found');
    }
} else if (User_role == 'Admin') { // Use 'else if' with a space
    let profile = document.getElementById('profile');
    if (profile) {
        let profilePage = profile.getAttribute('href');
        if (profilePage == 'profile.html') {
            profile.setAttribute('href', 'profile.html');
        } else {
            console.log('Href is not found');
        }
    } else {
        console.log('Profile element not found');
    }
} else {
    console.log('User Role is not found');
}
