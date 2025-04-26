document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
  
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('error');
  
        try {
          const res = await axios.post('http://localhost:5000/register', {
            name,
            email,
            password
          });
  
          localStorage.setItem('token', res.data.token);
  
          window.location.href = 'cars.html';
        } catch (err) {
          errorElement.textContent = err.response?.data?.message || 'Registration failed';
        }
      });
    }
  });
  