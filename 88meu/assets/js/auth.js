function register() {
  const user = document.getElementById("reg_username").value;
  const pass = document.getElementById("reg_password").value;

  localStorage.setItem(user, pass);
  alert("Compte créé !");
  window.location.href = "login.html";
}

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const saved = localStorage.getItem(user);

  if (saved === pass) {
    if (role === "admin") {
      window.location.href = "admin/dashboard.html";
    } else {
      window.location.href = "user/dashboard.html";
    }
  } else {
    alert("Identifiants invalides");
  }
}

function logout() {
  window.location.href = "../login.html";
}
