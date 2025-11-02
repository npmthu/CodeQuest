const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegister = document.getElementById("show-register");
const showLogin = document.getElementById("show-login");
const title = document.getElementById("form-title");
const homeLink = document.getElementById("home-link");



showRegister.addEventListener("click", () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  title.textContent = "Đăng ký";
}); 
 
showLogin.addEventListener("click", () => {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  title.textContent = "Đăng nhập";
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault(); 

  // lấy dữ liệu (nếu cần)
  const username = loginForm.querySelector('input[type="text"]').value;
  const password = loginForm.querySelector('input[type="password"]').value;

  if (username && password) {
    alert("Đăng nhập thành công!");
    window.location.href = "home.html";
  } else {
    alert("Vui lòng nhập đầy đủ thông tin!");
  }
});

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  window.location.href = "home.html";
});

