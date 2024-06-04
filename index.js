require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

const destinations = [
  { name: 'Pula', lat: 44.52599, lon: 13.505302, date: new Date('2024-06-04') },  // Dodajte željeni datum
  { name: 'Paris', lat: 48.8566, lon: 2.3522, date: new Date('2024-06-14') }, // Dodajte željeni datum
  { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, date: new Date('2024-12-30') } // Dodajte željeni datum
];


const apiKey = process.env.API_KEY;

app.get('/', async (req, res) => {
  try {
    // Logika za dane do destinacija
    const now = new Date();
    const daysToDestinations = destinations.map(destination => ({
      name: destination.name,
      days: Math.ceil((destination.date - now) / (1000 * 60 * 60 * 24)),
    }));

    // Dohvati trenutne vremenske podatke za svaki grad
    const weatherPromises = destinations.map(async destination => {
      const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${destination.lat}&lon=${destination.lon}&units=metric&appid=${apiKey}`);
      return {
        name: destination.name,
        //temperature: Math.round(parseFloat(weatherResponse.data.main.temp) * 10) / 10,
        temperature: Math.round(weatherResponse.data.main.temp) // Zaokruži temperaturu na cijeli broj
      
      };
    });
    
    // Pričekaj sve HTTP zahtjeve da se dovrše
    const weatherData = await Promise.all(weatherPromises);

    // Logika za doba dana
    const hour = new Date().getHours();
    let greeting = '';

    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    // Prikazi podatke
    res.render('index', { greeting, daysToDestinations, weatherData, destinations });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
