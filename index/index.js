var app = angular.module('myapp', ['ui.router'])
var url = "https://backend-hospital-management-angularjs.onrender.com/"

function setCurrentUser(user) {
    localStorage.setItem('hms_user', JSON.stringify(user))
}
function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('hms_user')) } catch (e) { return null }
}
function clearCurrentUser() {
    localStorage.removeItem('hms_user')
}

function formToJson(formId) {
    var form = document.getElementById(formId)
    var data = {}
    for (var i = 0; i < form.elements.length; i++) {
        var el = form.elements[i]
        if (el.name && el.type !== 'file' && el.type !== 'submit' && el.type !== 'button') {
            data[el.name] = el.value
        }
    }
    return data
}

function findName(arr, id) {
    if (!arr || !id) return ""
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == id) return arr[i].name
    }
    return ""
}

app.factory('httpInterceptor', function ($rootScope, $q) {
    var numLoadings = 0
    return {
        request: function (config) {
            numLoadings++
            $rootScope.loading = true
            return config
        },
        response: function (response) {
            if ((--numLoadings) === 0) {
                $rootScope.loading = false
            }
            return response
        },
        responseError: function (response) {
            if ((--numLoadings) === 0) {
                $rootScope.loading = false
            }
            if (response.config && response.config.skipErrorAlert) {
                return $q.reject(response)
            }
            Swal.fire({
                title: "Oops!",
                icon: "error",
                text: response.data && response.data.error ? response.data.error : "An unexpected error occurred.",
                confirmButtonColor: '#2f94cb',
                confirmButtonText: 'Got it'
            })
            return $q.reject(response)
        }
    }
})
app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor')
    $urlRouterProvider.otherwise('/')
    $stateProvider
        .state('signup', {
            url: '/signup',
            templateUrl: 'pages/signup_doctor.html'
        })
        .state('signup_', {
            url: '/signup_',
            templateUrl: 'pages/signup_patient.html'
        })
        .state('signin', {
            url: '/signin',
            templateUrl: 'pages/signin.html'
        })
        .state('/', {
            url: '/',
            templateUrl: 'pages/home.html'
        })
        .state('medical', {
            url: '/medical',
            templateUrl: 'pages/medical_history.html'
        })
        .state('profile', {
            url: '/profile',
            templateUrl: 'pages/profile.html'
        })
        .state('appointment', {
            url: '/appointment',
            templateUrl: 'pages/reception_appointment.html'
        })
});

app.controller('signup', function ($scope, $http, $state) {
    $scope.input_type = 'password'
    $scope.toggle = function () {
        $scope.input_type = $scope.input_type == 'password' ? 'text' : 'password'
    }
    $http.get(url + "genders").then(function (r) { $scope.genders = r.data })
    $http.get(url + "specializations").then(function (r) { $scope.specialization = r.data })
    $http.get(url + "qualifications").then(function (r) { $scope.qualification = r.data })

    $scope.dobcheck = function () {
        var dob = $scope.dob;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dob > today) {
            Swal.fire({ title: "Invalid Date", icon: "warning", text: "Date of birth cannot be in the future", confirmButtonColor: '#2f94cb' });
            return false;
        }
        return true;
    }
    $scope.submit = function () {
        if ($scope.password != $scope.confirm_password) {
            Swal.fire({ title: "Password Mismatch", icon: "warning", text: "Password and Confirm Password does not match", confirmButtonColor: '#2f94cb' })
            return
        }
        var data = formToJson("form")
        data.role = "Doctor"
        data.gender = findName($scope.genders, data.gender)
        data.specialization = findName($scope.specialization, data.specialization)
        data.qualification = findName($scope.qualification, data.qualification)
        $http.get(url + "users", { params: { email: data.email } }).then(function (r) {
            if (r.data.length > 0) {
                Swal.fire({ title: "Email Taken", icon: "warning", text: "This email is already registered", confirmButtonColor: '#2f94cb' })
                return
            }
            $http.post(url + "users", data).then(function () {
                Swal.fire({
                    title: "Welcome aboard!",
                    icon: "success",
                    text: "Doctor registered successfully!",
                    confirmButtonColor: '#2f94cb',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                })
                $state.go('signin')
            })
        })
    }
})

app.controller('signupctrl', function ($scope, $http, $state) {
    $scope.input_type = 'password'
    $scope.toggle = function () {
        $scope.input_type = $scope.input_type == 'password' ? 'text' : 'password'
    }
    $http.get(url + "genders").then(function (r) { $scope.genders = r.data })
    $http.get(url + "blood_groups").then(function (r) { $scope.bloods = r.data })

    $scope.dobcheck = function () {
        var dob = $scope.dob;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dob > today) {
            Swal.fire({ title: "Invalid Date", icon: "warning", text: "Date of birth cannot be in the future", confirmButtonColor: '#2f94cb' });
            return false;
        }
        return true;
    }
    $scope.submit = function () {
        if ($scope.password != $scope.confirm_password) {
            Swal.fire({ title: "Password Mismatch", icon: "warning", text: "Password and Confirm Password does not match", confirmButtonColor: '#2f94cb' })
            return
        }
        var data = formToJson("form")
        data.role = "Patient"
        data.gender = findName($scope.genders, data.gender)
        data.blood_group = findName($scope.bloods, data.blood_group)
        $http.get(url + "users", { params: { email: data.email } }).then(function (r) {
            if (r.data.length > 0) {
                Swal.fire({ title: "Email Taken", icon: "warning", text: "This email is already registered", confirmButtonColor: '#2f94cb' })
                return
            }
            $http.post(url + "users", data).then(function () {
                Swal.fire({
                    title: "Welcome aboard!",
                    icon: "success",
                    text: "Patient registered successfully!",
                    confirmButtonColor: '#2f94cb',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                })
                $state.go('signin')
            })
        })
    }
})

app.controller('signin', function ($scope, $http, $state) {
    $scope.input_type = 'password'
    $scope.toggle = function () {
        $scope.input_type = $scope.input_type == 'password' ? 'text' : 'password'
    }
    $scope.submit = function () {
        if (!$scope.email || !$scope.password) {
            Swal.fire({ title: "Missing Fields", icon: "warning", text: "Please enter both email and password", confirmButtonColor: '#2f94cb' })
            return
        }
        $http.get(url + "users", { params: { email: $scope.email, password: $scope.password } }).then(function (response) {
            var users = response.data
            if (users.length > 0) {
                setCurrentUser(users[0])
                Swal.fire({
                    title: "Welcome back!",
                    icon: "success",
                    html: "<p class='mb-0'>Logged in as <strong>" + users[0].first_name + "</strong></p>",
                    confirmButtonColor: '#2f94cb',
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false
                })
                if (users[0].role == "Receptionist" || users[0].role == "Doctor") {
                    $state.go('appointment')
                } else {
                    $state.go('/')
                }
            } else {
                Swal.fire({
                    title: "Login Failed",
                    icon: "error",
                    text: "Invalid email or password. Please try again.",
                    confirmButtonColor: '#2f94cb',
                    confirmButtonText: 'Try Again'
                })
            }
        })
    }
})

app.controller('home', function ($scope, $http, $state) {
    var currentUser = getCurrentUser()
    $scope.user = !!currentUser

    $scope.logout = function () {
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to sign out?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="ri-logout-box-r-line"></i> Yes, Sign Out',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            reverseButtons: true
        }).then(function (result) {
            if (result.isConfirmed) {
                clearCurrentUser()
                $scope.$apply(function () { $state.go("signin") })
            }
        })
    }
    $scope.selectedSpecialization = ""
    $scope.dobcheck = function () {
        var dob = $scope.dob
        var today = new Date()
        today.setHours(0, 0, 0, 0)
        if (new Date(dob) < today) {
            Swal.fire({ title: "Invalid Date", icon: "warning", text: "Appointment date must be today or later", confirmButtonColor: '#2f94cb' })
            return false
        }
        return true
    }
    $http.get(url + "specializations").then(function (r) { $scope.specialization = r.data })
    $http.get(url + "users?role=Doctor").then(function (r) { $scope.doctors = r.data })

    $scope.submit = function () {
        if (!currentUser) {
            Swal.fire({ title: "Not Logged In", icon: "warning", text: "Please login to book an appointment", confirmButtonColor: '#2f94cb' })
            return
        }
        var date = $scope.dob.toLocaleDateString("sv-sv")
        var time = $scope.time.toLocaleTimeString()
        var doctorId = $scope.doctor
        var doctor = null
        for (var i = 0; i < $scope.doctors.length; i++) {
            if ($scope.doctors[i].id == doctorId) { doctor = $scope.doctors[i]; break }
        }
        var appointment = {
            doctor_id: doctorId,
            patient_id: currentUser.id,
            doctor_first_name: doctor ? doctor.first_name : "",
            doctor_last_name: doctor ? doctor.last_name : "",
            doctor_specialization_name: doctor ? doctor.specialization : "",
            patient_first_name: currentUser.first_name,
            patient_last_name: currentUser.last_name,
            patient_history: currentUser.medical_history || "",
            name: doctor ? doctor.first_name + " " + doctor.last_name : "",
            specialization: doctor ? doctor.specialization : "",
            appointment_date: date,
            appointment_time: time,
            reason_to_visit: $scope.reason_to_visit,
            status: "Pending",
            fees: 200,
            prescription: ""
        }
        $http.post(url + "appointments", appointment).then(function () {
            Swal.fire({
                title: "Appointment Booked!",
                icon: "success",
                html: "<p class='mb-0'>Your appointment has been scheduled successfully</p>",
                confirmButtonColor: '#2f94cb',
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false
            })
            document.getElementById("Appointment").reset()
            $scope.selectedSpecialization = ""
        })
    }
    $scope.clear = function () {
        document.getElementById("Appointment").reset()
        $scope.selectedSpecialization = ""
    }
})

app.controller('medical', function ($scope, $http, $state) {
    var currentUser = getCurrentUser()
    if (!currentUser) { $state.go('signin'); return }

    function loadAppointments() {
        $http.get(url + "appointments", { params: { patient_id: currentUser.id } }).then(function (r) {
            $scope.appointments = r.data
        })
    }
    loadAppointments()

    $scope.cancel = function (id) {
        Swal.fire({
            title: 'Cancel Appointment?',
            text: 'Are you sure you want to cancel this appointment?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Cancel it',
            cancelButtonText: 'No, Keep it',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            reverseButtons: true
        }).then(function (result) {
            if (result.isConfirmed) {
                $http.patch(url + "appointments/" + id, { status: "Cancelled by patient" }).then(function () {
                    Swal.fire({
                        title: "Cancelled",
                        icon: "success",
                        text: "Appointment has been cancelled",
                        confirmButtonColor: '#2f94cb',
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false
                    })
                    loadAppointments()
                })
            }
        })
    }

    $scope.down = function (id) {
        var appointment = null
        for (var i = 0; i < $scope.appointments.length; i++) {
            if ($scope.appointments[i].id == id) { appointment = $scope.appointments[i]; break }
        }
        if (!appointment || !appointment.prescription) {
            Swal.fire({ title: "No Prescription", icon: "info", text: "No prescription available", confirmButtonColor: '#2f94cb' })
            return
        }
        var text = "========================================\n"
        text += "           PRESCRIPTION\n"
        text += "========================================\n\n"
        text += "Doctor: Dr. " + appointment.name + "\n"
        text += "Specialization: " + appointment.specialization + "\n"
        text += "Date: " + appointment.appointment_date + "\n"
        text += "Time: " + appointment.appointment_time + "\n\n"
        text += "Patient: " + appointment.patient_first_name + " " + appointment.patient_last_name + "\n\n"
        text += "----------------------------------------\n"
        text += "Prescription:\n" + appointment.prescription + "\n"
        text += "----------------------------------------\n"
        var blob = new Blob([text], { type: 'text/plain' })
        var link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'prescription_' + appointment.appointment_date + '.txt'
        link.click()
        URL.revokeObjectURL(link.href)
    }

    $scope.logout = function () {
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to sign out?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="ri-logout-box-r-line"></i> Yes, Sign Out',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            reverseButtons: true
        }).then(function (result) {
            if (result.isConfirmed) {
                clearCurrentUser()
                $scope.$apply(function () { $state.go("signin") })
            }
        })
    }
})

app.controller('appointment', function ($scope, $http, $state) {
    var currentUser = getCurrentUser()
    if (!currentUser) { $state.go('signin'); return }
    $scope.user = currentUser.role

    $scope.logout = function () {
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to sign out?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="ri-logout-box-r-line"></i> Yes, Sign Out',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            reverseButtons: true
        }).then(function (result) {
            if (result.isConfirmed) {
                clearCurrentUser()
                $scope.$apply(function () { $state.go("signin") })
            }
        })
    }
    $scope.consult = function (id) {
        var appointmentId = id || $scope.selectedAppointmentId
        var pre = document.getElementById("pre").value
        $http.patch(url + "appointments/" + appointmentId, { status: "Consulted", prescription: pre }).then(function () {
            Swal.fire({
                title: "Consultation Done",
                icon: "success",
                text: "Prescription has been saved",
                confirmButtonColor: '#2f94cb',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })
            show()
        })
    }
    $scope.appointments = []
    $scope.selectedAppointmentId = null
    function show() {
        var params = {}
        if (currentUser.role === 'Doctor') params.doctor_id = currentUser.id
        $http.get(url + "appointments", { params: params }).then(function (r) {
            $scope.appointments = r.data
        })
    }
    $scope.selectAppointment = function (id) {
        $scope.selectedAppointmentId = id
    }
    $scope.approve = function (id) {
        var status = currentUser.role === 'Doctor' ? 'Accepted by doctor' : 'Accepted by receptionist'
        $http.patch(url + "appointments/" + id, { status: status }).then(function () {
            Swal.fire({
                title: "Approved!",
                icon: "success",
                text: "Appointment has been approved",
                confirmButtonColor: '#2f94cb',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false
            })
            show()
        })
    }
    $scope.reject = function (id) {
        var appointmentId = id || $scope.selectedAppointmentId
        var reason = document.getElementById("reason").value
        var status = currentUser.role === 'Doctor' ? 'Rejected by doctor' : 'Rejected by receptionist'
        $http.patch(url + "appointments/" + appointmentId, { status: status, reason_for_cancel: reason }).then(function () {
            Swal.fire({
                title: "Rejected",
                icon: "info",
                text: "Appointment has been rejected",
                confirmButtonColor: '#2f94cb',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false
            })
            show()
        })
    }
    $scope.clear = function () {}
    show()
})

app.controller('profile', function ($scope, $http, $state) {
    var currentUser = getCurrentUser()
    if (!currentUser) { $state.go('signin'); return }

    $scope.role = currentUser.role
    $scope.editData = {}

    $http.get(url + "genders").then(function (r) { $scope.genders = r.data })
    if (currentUser.role === 'Patient') {
        $http.get(url + "blood_groups").then(function (r) { $scope.bloods = r.data })
    }
    if (currentUser.role === 'Doctor') {
        $http.get(url + "specializations").then(function (r) { $scope.specializations = r.data })
        $http.get(url + "qualifications").then(function (r) { $scope.qualifications = r.data })
    }

    function loadProfile() {
        $http.get(url + "users/" + currentUser.id).then(function (r) {
            var user = r.data
            setCurrentUser(user)
            $scope.fname = user.first_name
            $scope.lname = user.last_name
            $scope.email = user.email
            $scope.dob = user.dob
            $scope.phone = user.phone_no
            $scope.blood = user.blood_group
            $scope.gender = user.gender
            $scope.address = user.address
            $scope.history = user.medical_history
            $scope.height = user.height
            $scope.weight = user.weight
            $scope.qua = user.qualification
            $scope.spec = user.specialization
            $scope.exp = user.experience
        })
    }
    loadProfile()

    $scope.startEdit = function () {
        $scope.editData = {
            first_name: $scope.fname,
            last_name: $scope.lname,
            dob: $scope.dob,
            phone_no: $scope.phone,
            gender: $scope.gender,
            address: $scope.address
        }
        if ($scope.role === 'Patient') {
            $scope.editData.blood_group = $scope.blood
            $scope.editData.medical_history = $scope.history
            $scope.editData.height = $scope.height
            $scope.editData.weight = $scope.weight
        }
        if ($scope.role === 'Doctor') {
            $scope.editData.qualification = $scope.qua
            $scope.editData.specialization = $scope.spec
            $scope.editData.experience = $scope.exp
        }
    }

    $scope.saveProfile = function () {
        $http.patch(url + "users/" + currentUser.id, $scope.editData).then(function () {
            Swal.fire({
                title: "Updated!",
                icon: "success",
                text: "Profile updated successfully",
                confirmButtonColor: '#2f94cb',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false
            })
            loadProfile()
            var modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'))
            if (modal) modal.hide()
        })
    }

    $scope.logout = function () {
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to sign out?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="ri-logout-box-r-line"></i> Yes, Sign Out',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            reverseButtons: true
        }).then(function (result) {
            if (result.isConfirmed) {
                clearCurrentUser()
                $scope.$apply(function () { $state.go("signin") })
            }
        })
    }
})