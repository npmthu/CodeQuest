const API_BASE_URL = 'http://localhost:3000/api';

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

// Handle Login
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault(); 

  const username = loginForm.querySelector('input[type="text"]').value;
  const password = loginForm.querySelector('input[type="password"]').value;

  if (!username || !password) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.status === 'ok') {
      // Save token to localStorage
      localStorage.setItem('token', data.data);
      alert("Đăng nhập thành công!");
      window.location.href = "home.html";
    } else {
      alert(data.error || "Đăng nhập thất bại!");
    }
  } catch (error) {
    console.error('Login error:', error);
    alert("Có lỗi xảy ra. Vui lòng thử lại!");
  }
});

// Handle Register
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = registerForm.querySelector('input[type="text"]').value;
  const password = registerForm.querySelector('input[type="password"]').value;

  if (!username || !password) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.status === 'ok') {
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      // Switch to login form
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
      title.textContent = "Đăng nhập";
      registerForm.reset();
    } else {
      alert(data.error || "Đăng ký thất bại!");
    }
  } catch (error) {
    console.error('Register error:', error);
    alert("Có lỗi xảy ra. Vui lòng thử lại!");
  }
});

