// index.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5001;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Sample endpoint to run code
app.post('/run-code', async (req, res) => {
    try {
        const { code, language_id } = req.body;

        console.log('Received code:', code);
        console.log('Received language ID:', language_id);
        
        // Replace this section with your actual code execution logic
        const output = await executeCode(code, language_id);

        // Send the output back to the client
        res.status(200).json({ output });
    } catch (err) {
        // Log the error
        console.error('Error occurred:', JSON.stringify(err, null, 2));
        // Send an error response
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Mock function to simulate code execution
async function executeCode(code, language_id) {
    // Simulating successful execution; replace this with actual logic
    if (language_id === 71) { // For example, let's assume 71 is for Python
        return `Output: ${eval(code)}`; // WARNING: Using eval can be dangerous! Use a proper execution environment.
    }
    throw new Error('Unsupported language ID');
}
// New endpoint to execute notebook
app.post('/execute-notebook', async (req, res) => {
    try {
        const { notebook } = req.body;

        console.log('Received notebook:', notebook);
        
        // Replace this section with your actual notebook execution logic
        const output = await executeNotebook(notebook);

        // Send the output back to the client
        res.status(200).json({ output });
    } catch (err) {
        // Log the error
        console.error('Error occurred:', JSON.stringify(err, null, 2));
        // Send an error response
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Mock function to simulate notebook execution
async function executeNotebook(notebook) {
    // Simulating successful execution; replace this with actual logic
    return `Notebook execution output: ${JSON.stringify(notebook).slice(0, 100)}...`;
}

// Start the server
app.listen(5001, () => {
    console.log(`Server running on port 5001`);
});
