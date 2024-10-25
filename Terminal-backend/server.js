const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(bodyParser.json());

// Set the terminal_files directory
const TERMINAL_FILES_DIR = path.join(__dirname, 'terminal_files'); // Ensure this points to the correct folder

// Ensure terminal_files directory exists
const ensureDirectoryExists = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

ensureDirectoryExists(TERMINAL_FILES_DIR);

// Endpoint to create a folder
app.post('/create-folder', async (req, res) => {
  const { parentPath, folderName } = req.body;
  const newFolderPath = path.join(TERMINAL_FILES_DIR, parentPath, folderName);

  try {
    await fs.mkdir(newFolderPath, { recursive: true });
    res.json({ message: `Folder created: ${folderName}` });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to execute shell commands
app.post('/execute', async (req, res) => {
  const { command, currentDirectory } = req.body;
  const fullPath = path.join(TERMINAL_FILES_DIR, currentDirectory || '');

  const execPromise = util.promisify(exec);

  try {
    if (command.startsWith('cd ')) {
      const targetDir = command.split(' ')[1];
      const newPath = path.resolve(fullPath, targetDir);
      try {
        await fs.access(newPath);
        const relativePath = path.relative(TERMINAL_FILES_DIR, newPath);
        res.json({ output: '', newDirectory: relativePath });
      } catch {
        res.json({ error: `cd: ${targetDir}: No such file or directory` });
      }
    } else {
      const { stdout, stderr } = await execPromise(command, { cwd: fullPath });
      res.json({ output: stdout || stderr });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});