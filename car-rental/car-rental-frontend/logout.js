document.addEventListener('DOMContentLoaded', () => {
  const logoutLink = document.getElementById('logout');

  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        const response = await fetch('http://localhost:5000/logout', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          window.location.href = 'login.html';
        } else {
          alert('Logout failed. Please try again.');
        }
      } catch {
        alert('An error occurred. Please try again.');
      }
    });
  }
});
