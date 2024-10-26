const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
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

let currentProcess;
let dataBuffer = '';

// Route to handle code execution via POST request
app.post('/execute', async (req, res) => {
    const { source_code, language_id } = req.body;
    
    if (language_id === 62) { // Java
        try {
            // Write the Java code to a temporary file
            await fs.writeFile('Main.java', source_code);
            
            // Compile the Java code
            const compileProcess = spawn('javac', ['Main.java']);
            
            compileProcess.stderr.on('data', (data) => {
                dataBuffer += data.toString();
            });
            
            compileProcess.on('close', (code) => {
                if (code !== 0) {
                    res.json({ status: 'error', output: dataBuffer });
                    dataBuffer = '';
                    return;
                }
                
                // Run the compiled Java program
                currentProcess = spawn('java', ['Main']);
                
                currentProcess.stdout.on('data', (data) => {
                    dataBuffer += data.toString();
                    checkForInput(res);
                });
                
                currentProcess.stderr.on('data', (data) => {
                    dataBuffer += data.toString();
                });
                
                currentProcess.on('close', (code) => {
                    if (!res.headersSent) {
                        res.json({ status: 'completed', output: dataBuffer });
                    }
                    dataBuffer = '';
                });
            });
        } catch (error) {
            res.json({ status: 'error', output: error.message });
        }
    } else {
        // Handle other languages (e.g., Python) as before
        currentProcess = spawn('python', ['-c', source_code]);
        
        dataBuffer = '';

        currentProcess.stdout.on('data', (data) => {
            dataBuffer += data.toString();
            checkForInput(res);
        });

        currentProcess.stderr.on('data', (data) => {
            dataBuffer += data.toString();
        });

        currentProcess.on('close', (code) => {
            if (!res.headersSent) {
                res.json({ status: 'completed', output: dataBuffer });
            }
            dataBuffer = '';
        });
    }
});

// Route to handle input provision via POST request
app.post('/provide-input', (req, res) => {
  const { input } = req.body;
  if (currentProcess && !currentProcess.killed) {
    currentProcess.stdin.write(input + '\n');
    
    setTimeout(() => {
      checkForInput(res);
    }, 100);
  } else {
    res.status(400).json({ error: 'No active process' });
  }
});

function checkForInput(res) {
  if (res.headersSent) return;

  if (dataBuffer.trim().endsWith(':')) {
    res.json({ status: 'input_required', prompt: dataBuffer });
    dataBuffer = '';
  } else if (dataBuffer.includes('\n')) {
    res.json({ status: 'output', data: dataBuffer });
    dataBuffer = '';
  }
}

// Start the server
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
