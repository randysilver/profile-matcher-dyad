import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Store processing status
let processingStatus = {
  isProcessing: false,
  progress: 0,
  totalRecords: 0,
  processedRecords: 0,
  currentEmail: "",
  status: "idle"
};

// Create input file and run Python script
app.post('/api/start', (req, res) => {
  if (processingStatus.isProcessing) {
    return res.status(400).json({ error: "Processing already in progress" });
  }

  const { emailData, linkedinEmail, linkedinPassword } = req.body;

  // Create input file
  fs.writeFileSync(path.join(__dirname, 'input_emails.csv'), emailData);

  // Set environment variables for LinkedIn credentials
  process.env.LINKEDIN_EMAIL = linkedinEmail;
  process.env.LINKEDIN_PASSWORD = linkedinPassword;

  // Start Python process
  const pythonProcess = spawn('python', [path.join(__dirname, 'linkedin_matcher.py')]);

  processingStatus.isProcessing = true;
  processingStatus.status = "starting";

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    // Parse progress from output (this would need to be implemented in the Python script)
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    processingStatus.isProcessing = false;
    processingStatus.status = code === 0 ? "completed" : "failed";
  });

  res.json({ message: "Processing started" });
});

// Get processing status
app.get('/api/status', (req, res) => {
  res.json(processingStatus);
});

// Stop processing (simplified)
app.post('/api/stop', (req, res) => {
  processingStatus.isProcessing = false;
  processingStatus.status = "stopped";
  res.json({ message: "Processing stopped" });
});

// Get results
app.get('/api/results', (req, res) => {
  const resultsPath = path.join(__dirname, 'linkedin_results.csv');
  
  if (!fs.existsSync(resultsPath)) {
    return res.status(404).json({ error: "Results file not found" });
  }

  const results = fs.readFileSync(resultsPath, 'utf8');
  res.json({ data: results });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});