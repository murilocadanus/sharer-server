const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');

// Import routes
const fileRoute = require('./routes/fileRoute');
// Import services
const responder = require('./services/responder');
const file = require('./services/file');

// Define PORT
const PORT = process.env.PORT;

// Set up web server with express and socket.io
const app = express()
const httpServer = http.Server(app);

app.use(cors());
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());
// Returning 200 on index route for health purposes
app.get('/', (req, res) => res.send());

// Initialize response
app.use((req, res, next) => {
    next();
});
app.use(responder.init);

// Routes
app.get('/file/download', fileRoute.download);
app.get('/file/downloadDictionary', fileRoute.downloadDictionary);
app.post('/file/upload', fileRoute.upload);

// Respond to the client
app.use(responder.reply);

// Start the server
httpServer.listen(PORT, (err) => {
    err ? console.error(err) //logger.error(err)
    : console.info(`Server running at ${PORT}`); //logger.info(`Server running at ${PORT}`);
    file.generateDictionary();
});