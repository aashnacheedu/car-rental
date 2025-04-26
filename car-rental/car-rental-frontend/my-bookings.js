document.addEventListener('DOMContentLoaded', async () => {
  const bookingsContainer = document.getElementById('bookings');

  try {
    const userRes = await fetch('http://localhost:5000/session', {
      credentials: 'include',
    });

    if (userRes.status !== 200) {
      window.location.href = '/login.html';
      return;
    }

    const response = await fetch('http://localhost:5000/bookings', {
      credentials: 'include',
    });

    const data = await response.json();

    if (response.status === 200) {
      if (data.bookings.length === 0) {
        bookingsContainer.textContent = 'No bookings found.';
      } else {
        data.bookings.forEach((booking) => {
          const card = document.createElement('div');
          card.classList.add('booking-item');

          const startDate = new Date(booking.start_date).toLocaleDateString();
          const endDate = new Date(booking.end_date).toLocaleDateString();

          const content = `
            <h3>${booking.make} ${booking.model} (${booking.year})</h3>
            <p><strong>Color:</strong> ${booking.color}</p>
            <p><strong>Booking Dates:</strong> ${startDate} - ${endDate}</p>
            <p><strong>Price Per Day:</strong> $${booking.price_per_day}</p>
          `;

          card.innerHTML = content;
          bookingsContainer.appendChild(card);
        });
      }
    } else {
      bookingsContainer.textContent = data.message || 'Could not fetch bookings.';
    }
  } catch {
    bookingsContainer.textContent = 'Something went wrong.';
  }

  document.getElementById('return-btn').addEventListener('click', () => {
    window.location.href = '/dashboard.html';
  });
});
