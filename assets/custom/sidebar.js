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

// $(document).ready(function () {
    // Check if user_role_variable is already declared
    if (typeof user_role_variable === 'undefined') {
        var user_role_variable = localStorage.getItem('User_role'); // Use 'var' to avoid redeclaration
    }

    // Load header
    $('#header-placeholder').load('header.html', function() {
        if (user_role_variable) {
            $('#role').text(user_role_variable);
        } else {
            $('#role').text('Guest');
        }
    });

    // Load sidebar based on user_role_variable
    if (user_role_variable && user_role_variable.toLowerCase() === "admin") {
        $('#sidebar-placeholder').load('admin-sidebar.html');
        console.log('Admin Logged In');
    } else if (user_role_variable && user_role_variable.toLowerCase() === "employee") {
        $('#sidebar-placeholder').load('employee-sidebar.html');
        console.log('Employee Logged In');
    } else if (user_role_variable && user_role_variable.toLowerCase() === "hr") {
        $('#sidebar-placeholder').load('hr-sidebar.html');
        console.log('HR Logged In');
    } else if (user_role_variable && user_role_variable.toLowerCase() === "manager") {
        $('#sidebar-placeholder').load('manager-sidebar.html');
        console.log('Manager Logged In');
    } else {
        console.log('Guest Logged In');
    }
// });
