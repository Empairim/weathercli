const yargs = require('yargs');
const express = require('express');
const axios = require('axios');
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const WEATHER_API_KEY = process.env.API_KEY;
console.log('Retrieving weather data from OpenWeatherMap.org');

async function getWeather(city) {
  console.log('API key:', WEATHER_API_KEY);
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;

  console.log(url)
  try {
    const response = await axios.get(url);
    const { name, main: { temp } } = response.data;
    const tempF = (temp * 1.8) + 32;
    let color;
    if (tempF < 60) {
      color = 'blue';
    } else if (tempF >= 60 && tempF <= 80) {
      color = 'yellow';
    } else {
      color = 'red';
    }
    const message = `The current temperature in ${name} is ${chalk[color](tempF.toFixed(1) + '°F')}`;
    console.log('Temperature message:', message);
    fs.writeFileSync('temperature.txt', message);
    console.log('writing to file')
    console.log(chalk.green(figlet.textSync(message)));
    return message;
  } catch (error) {
    console.error(chalk.bold.red(error));
    throw error;
  }
}

app.get('/weather', async (req, res) => {
  const { city } = req.query;
  try {
    const message = await getWeather(city);
    res.send(message);
    console.log('Response sent successfully');
  } catch (error) {
    console.log('Error:', error);
    console.error(chalk.bold.red(error));
    res.status(500).send(error);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
  promptUser();
});

// Prompt the user for input
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptUser() {
  readline.question('Enter a city name to get the weather (or "quit" to exit): ', async (city) => {
    if (city.toLowerCase() === 'quit') {
      readline.close();
      console.log('Exiting...');
      process.exit(0);
    } else {
      try {
        const message = await getWeather(city);
        console.log(message);
      } catch (error) {
        console.error(chalk.bold.red(error));
      }
      promptUser();
    }
  });
}