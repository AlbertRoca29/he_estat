const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const dataFilePath = 'userData.json';

// Serve static files from the 'public' folder
app.use(express.static('public'));
app.use(express.json()); // Middleware to parse JSON request bodies

// Endpoint to get user data
app.get('/api/user-data', (req, res) => {
  const userId = req.query.userId; // Assume we get user ID from query params
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading user data');
    } else {
      const userData = JSON.parse(data);
      res.json(userData[userId] || { visitedCountries: [] });
    }
  });
});

// Endpoint to save user data
app.post('/api/user-data', (req, res) => {
  const { userId, visitedCountries } = req.body;
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading user data');
    } else {
      const userData = JSON.parse(data);
      userData[userId] = { visitedCountries };
      fs.writeFile(dataFilePath, JSON.stringify(userData), (err) => {
        if (err) {
          res.status(500).send('Error saving user data');
        } else {
          res.send('User data saved');
        }
      });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
