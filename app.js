const express = require('express');
const app = express();

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Add a test route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Enhanced server startup with error handling
const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('Error: Port 3000 is already in use');
    } else {
        console.error('Error starting server:', err);
    }
}); 