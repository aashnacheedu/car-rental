document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('booking-form');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const car_id = document.getElementById('car-id').value;
      const booking_date = document.getElementById('booking-date').value;
  
      try {
        const response = await fetch('http://localhost:5000/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ car_id, booking_date })
        });
  
        const data = await response.json();
  
        if (response.ok) {
          document.getElementById('booking-message').textContent = 'Booking successful!';
          form.reset();
        } else {
          document.getElementById('booking-message').textContent = data.message || 'Booking failed.';
        }
      } catch (err) {
        console.error('Booking error:', err);
        document.getElementById('booking-message').textContent = 'Something went wrong.';
      }
    });
  });
  