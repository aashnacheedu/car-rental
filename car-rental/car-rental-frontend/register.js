document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const userData = { name, email, password };

      try {
        const response = await fetch('http://localhost:5000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.status === 201) {
          alert('Registration successful!');
          window.location.href = '/login';
        } else {
          document.getElementById('error-message').textContent = data.message || 'An error occurred';
        }
      } catch {
        document.getElementById('error-message').textContent = 'Something went wrong. Please try again later.';
      }
    });
  }
});
