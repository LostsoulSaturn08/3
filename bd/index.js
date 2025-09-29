require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const path = require('path');

const taskRoutes = require('./routes/taskRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// CRITICAL FIX: Explicitly allow methods and headers.
// The browser sends a preflight (OPTIONS) request, and this configuration
// ensures it gets permission to send the subsequent request with the 'Authorization' header.
app.use(cors({
  origin: 'http://localhost:5173', // Assuming React is on port 5173
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // MUST explicitly allow Authorization
}));

// Middleware order is crucial: JSON body parser goes after CORS
app.use(express.json());

// Serve static profile image files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Welcome to the Spade1 API server!');
});

app.use('/api/tasks', taskRoutes);
app.use('/api', profileRoutes);
app.use('/api', userRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});