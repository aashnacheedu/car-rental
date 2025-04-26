document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.status === 200) {
          alert('Login successful!');
          window.location.href = 'dashboard.html';
        } else {
          document.getElementById('login-error').textContent = data.message || 'Login failed';
        }
      } catch {
        document.getElementById('login-error').textContent = 'Something went wrong.';
      }
    });
  }
});
