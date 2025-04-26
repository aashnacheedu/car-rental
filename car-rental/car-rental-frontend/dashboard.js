document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  const carListContainer = document.getElementById('car-list');
  const bookingMessage = document.getElementById('booking-message');

  async function fetchAvailableCars() {
    const start_date = document.getElementById('start-date').value;
    const end_date = document.getElementById('end-date').value;

    if (!start_date || !end_date) return;

    try {
      const response = await fetch(`http://localhost:5000/cars?start_date=${start_date}&end_date=${end_date}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        carListContainer.innerHTML = '';
        data.cars.forEach(car => {
          const carElement = document.createElement('div');
          carElement.classList.add('car');
          carElement.innerHTML = `
            <p>${car.make} ${car.model} (${car.year})</p>
            <p>Price per day: $${car.price_per_day}</p>
            <button data-car-id="${car.id}" class="book-btn">Book</button>
          `;
          carListContainer.appendChild(carElement);
        });

        const bookButtons = document.querySelectorAll('.book-btn');
        bookButtons.forEach(button => {
          button.addEventListener('click', async (e) => {
            const carId = e.target.getAttribute('data-car-id');
            await handleBooking(carId, start_date, end_date);
          });
        });
      } else {
        bookingMessage.textContent = 'No cars available for the selected dates.';
      }
    } catch {
      bookingMessage.textContent = 'Failed to fetch available cars.';
    }
  }

  async function handleBooking(car_id, start_date, end_date) {
    try {
      const response = await fetch('http://localhost:5000/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ car_id, start_date, end_date })
      });

      const data = await response.json();

      if (response.ok) {
        bookingMessage.textContent = 'Booking successful!';
      } else {
        bookingMessage.textContent = data.message || 'Booking failed.';
      }
    } catch {
      bookingMessage.textContent = 'Something went wrong during booking.';
    }
  }

  document.getElementById('start-date').addEventListener('change', fetchAvailableCars);
  document.getElementById('end-date').addEventListener('change', fetchAvailableCars);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      fetchAvailableCars();
    });
  }

  fetchAvailableCars();
});
