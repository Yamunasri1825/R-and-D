const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());

// Update CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',  // Allow requests from your frontend origin
  methods: ['GET', 'POST'],         // Allowed methods
  credentials: true,                // Allow credentials such as cookies
};

app.use(cors(corsOptions));

// Judge0 API configuration
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const JUDGE0_API_KEY = '4957ce6f54mshc63a46f01f2ec66p198804jsn8fedbc7a7b74'; // Replace with your actual API key

// Route to handle code execution via POST request
app.post('/execute', async (req, res) => {
    const { source_code, language_id } = req.body;

    if (typeof source_code !== 'string' || !source_code.trim()) {
        return res.status(400).json({ error: { message: 'source_code must be a non-empty string.' } });
    }

    if (!language_id || typeof language_id !== 'number') {
        return res.status(400).json({ error: { message: 'language_id must be provided as a number.' } });
    }

    try {
        const submissionResponse = await axios.post(
            `${JUDGE0_API_URL}?base64_encoded=false&wait=true`,
            {
                source_code: source_code,
                language_id: language_id,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': JUDGE0_API_KEY,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                },
            }
        );

        const { stdout, stderr, compile_output } = submissionResponse.data;

        res.json({
            results: [
                {
                    actualOutput: stdout || '',
                    errorOutput: stderr || '',
                    compilationError: compile_output || '',
                },
            ],
        });
    } catch (error) {
        res.status(500).json({
            error: {
                message: 'Error occurred while executing code.',
                details: error.response?.data || error.message,
            },
        });
    }
});

// Start the server
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
