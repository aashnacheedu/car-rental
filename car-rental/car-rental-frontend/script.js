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
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.status === 201) {
          alert('Registration successful!');
          window.location.href = '/login.html';
        } else {
          document.getElementById('error-message').textContent = data.message || 'An error occurred';
        }
      } catch {
        document.getElementById('error-message').textContent = 'Something went wrong. Please try again later.';
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const loginData = { email, password };

      try {
        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (response.status === 200) {
          alert('Login successful!');
          window.location.href = '/my-bookings.html';
        } else {
          document.getElementById('login-error').textContent = data.message || 'Login failed';
        }
      } catch {
        document.getElementById('login-error').textContent = 'Something went wrong.';
      }
    });
  }

  const carForm = document.getElementById('car-form');
  const carList = document.getElementById('car-list');

  if (carForm) {
    carForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const make = document.getElementById('make').value;
      const model = document.getElementById('model').value;
      const year = document.getElementById('year').value;
      const color = document.getElementById('color').value;
      const pricePerDay = document.getElementById('price-per-day').value;
      const available = document.getElementById('available').checked;

      const carData = {
        make,
        model,
        year: parseInt(year),
        color,
        price_per_day: parseFloat(pricePerDay),
        available,
      };

      try {
        const response = await fetch('http://localhost:5000/cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(carData),
        });

        const data = await response.json();

        if (response.status === 201) {
          alert('Car added successfully!');
          fetchCars();
        } else {
          alert(data.message || 'Car could not be added');
        }
      } catch {
        alert('Error adding car');
      }
    });

    async function fetchCars() {
      try {
        const response = await fetch('http://localhost:5000/cars', {
          credentials: 'include',
        });
        const cars = await response.json();

        carList.innerHTML = '';

        cars.forEach((car) => {
          const li = document.createElement('li');
          li.innerHTML = `
            ${car.make} ${car.model} (${car.year}) - $${car.price_per_day}/day - ${car.available ? 'Available' : 'Unavailable'}
          `;

          if (car.available) {
            const startDateInput = document.createElement('input');
            startDateInput.type = 'date';
            startDateInput.placeholder = 'Start Date';

            const endDateInput = document.createElement('input');
            endDateInput.type = 'date';
            endDateInput.placeholder = 'End Date';

            const bookBtn = document.createElement('button');
            bookBtn.textContent = 'Book Now';
            bookBtn.addEventListener('click', async () => {
              const bookingData = {
                car_id: car.id,
                start_date: startDateInput.value,
                end_date: endDateInput.value,
              };

              if (!bookingData.start_date || !bookingData.end_date) {
                alert('Please select both start and end dates.');
                return;
              }

              try {
                const res = await fetch('http://localhost:5000/bookings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify(bookingData),
                });

                const result = await res.json();

                if (res.status === 201) {
                  alert('Booking successful!');
                } else {
                  alert(result.message || 'Booking failed.');
                }
              } catch {
                alert('Something went wrong while booking.');
              }
            });

            li.appendChild(startDateInput);
            li.appendChild(endDateInput);
            li.appendChild(bookBtn);
          }

          carList.appendChild(li);
        });
      } catch {
        alert('Error fetching cars');
      }
    }

    fetchCars();
  }

  const bookingForm = document.getElementById('booking-form');
  const bookingMessage = document.getElementById('booking-message');
  const bookingList = document.getElementById('booking-list');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const carId = document.getElementById('car-id').value;
      const startDate = document.getElementById('start-date').value;
      const endDate = document.getElementById('end-date').value;

      const bookingData = { car_id: carId, start_date: startDate, end_date: endDate };

      try {
        const response = await fetch('http://localhost:5000/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(bookingData),
        });

        const data = await response.json();

        if (response.status === 201) {
          bookingMessage.textContent = 'Booking successful!';
          fetchBookings();
        } else {
          bookingMessage.textContent = data.message || 'Booking failed.';
        }
      } catch {
        bookingMessage.textContent = 'Server error. Please try again.';
      }
    });

    async function fetchBookings() {
      try {
        const response = await fetch('http://localhost:5000/bookings', {
          credentials: 'include',
        });
        const { bookings } = await response.json();

        bookingList.innerHTML = '';

        bookings.forEach((booking) => {
          const li = document.createElement('li');
          li.textContent = `Car ID: ${booking.car_id} | Start: ${booking.start_date} | End: ${booking.end_date}`;
          bookingList.appendChild(li);
        });
      } catch {
        alert('Error fetching bookings');
      }
    }

    fetchBookings();
  }
});
