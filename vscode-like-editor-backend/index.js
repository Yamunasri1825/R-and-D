const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const JUDGE0_API_KEY = 'cabee2222bmsh49dd68d9139c69ap1edb38jsn225a2a7fcfc3'; // Replace with your Judge0 API key

// Route to handle code execution
app.post('/execute', async (req, res) => {
    console.log('Received request body:', req.body); // Log the request body for debugging

    const { source_code, language_id } = req.body;

    // Validate input to ensure the request contains the required data
    if (typeof source_code !== 'string' || !source_code.trim()) {
        return res.status(400).json({
            error: {
                message: 'source_code must be a non-empty string.',
            },
        });
    }

    if (!language_id || typeof language_id !== 'number') {
        return res.status(400).json({
            error: {
                message: 'language_id must be provided as a number.',
            },
        });
    }

    try {
        // Sending the code execution request to Judge0 API
        const submissionResponse = await axios.post(
            `${JUDGE0_API_URL}?base64_encoded=false&wait=true`,
            {
                source_code: source_code, // This sends the source code
                language_id: language_id, // This sends the language ID
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': JUDGE0_API_KEY, // Add your API key here
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com', // Set the API host
                },
            }
        );

        // Log the full response for debugging
        console.log('Judge0 API Response:', submissionResponse.data);

        // Extracting the result from the response
        const { stdout, stderr, compile_output } = submissionResponse.data;

        // Send the result back to the client
        res.json({
            results: [
                {
                    actualOutput: stdout || '', // Output of the code execution
                    errorOutput: stderr || '', // Any errors from the execution
                    compilationError: compile_output || '', // Compilation errors if any
                },
            ],
        });
    } catch (error) {
        // Handle errors and log the issue
        console.error('Error during code execution:', error.message);
        console.error('Detailed error info:', error.response?.data || error.message);

        // Send an error response back to the client
        res.status(500).json({
            error: {
                message: 'Error occurred while executing code.',
                details: error.response?.data || error.message, // Detailed error info
            },
        });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
