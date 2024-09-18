const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const JUDGE0_API_KEY = 'cabee2222bmsh49dd68d9139c69ap1edb38jsn225a2a7fcfc3'; // Replace with your Judge0 API key

app.post('/execute', async (req, res) => {
  const { code, language_id } = req.body;

  try {
    const submissionResponse = await axios.post(
      `${JUDGE0_API_URL}?base64_encoded=false&wait=true`,
      {
        source_code: code,
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

    const result = submissionResponse.data;
    res.json({
      results: [
        {
          actualOutput: result.stdout,
          errorOutput: result.stderr,
          compilationError: result.compile_output,
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || 'Error occurred while executing code.',
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
