# LinkedIn Profile Matcher

A web application that finds and matches LinkedIn profiles with email addresses.

## Features

- Browser-based interface for easy use
- Upload CSV files or enter data manually
- Automated LinkedIn profile search
- Confidence scoring (HIGH, MEDIUM, LOW, NO)
- Results export to CSV
- Real-time console for monitoring

## Deployment Instructions

### Prerequisites

1. **Python 3.6+** installed
2. **Node.js 14+** installed
3. **Google Chrome** browser installed

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd <your-repository-folder>
   ```

2. **Install Python dependencies:**
   ```bash
   pip install selenium webdriver-manager
   ```

3. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

### Running the Application

You have two options to run the application:

#### Option 1: Run Frontend and Backend Separately (Recommended for Development)

1. **Start the backend server:**
   ```bash
   npm run server
   ```
   This starts the backend server on http://localhost:5000

2. **In a new terminal, start the frontend:**
   ```bash
   npm run dev
   ```
   This starts the React frontend on http://localhost:8080

#### Option 2: Run Both Together (Convenient for Testing)

```bash
npm run dev:full
```
This starts both the frontend (http://localhost:8080) and backend (http://localhost:5000) servers simultaneously.

### Usage

1. **Open the application:**
   Navigate to http://localhost:8080 in your browser

2. **Check server connection:**
   Make sure the "Connected to Backend Server" message is displayed at the top

3. **Enter Data:**
   - Upload a CSV file with Email and Name columns
   - Or manually enter data in the text area

4. **Enter LinkedIn Credentials:**
   - Provide your LinkedIn email and password
   - Credentials are only used for this session

5. **Start Matching:**
   - Click "Start Matching" to begin processing
   - Watch progress in the status panel and console

6. **View Results:**
   - Results will appear in the results panel
   - Download results as CSV when complete

### File Format

Input CSV should have this format:
```csv
Email,Name
john.doe@example.com,John Doe
jane.smith@example.com,Jane Smith
```

### Security Note

LinkedIn credentials are only used for the current session and are not stored permanently.

### Troubleshooting

- **Server connection error:** Make sure the backend server is running (`npm run server`)
- **Chrome not found:** Make sure Google Chrome is installed
- **Python errors:** Ensure Python 3.6+ is installed and in PATH
- **Port conflicts:** Change ports in server.js and vite.config.ts if needed
- **CORS errors:** Make sure both frontend and backend are running