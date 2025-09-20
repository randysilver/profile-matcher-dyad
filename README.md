# LinkedIn Profile Matcher

A web application that finds and matches LinkedIn profiles with email addresses.

## Features

- Browser-based interface for easy use
- Upload CSV files or enter data manually
- Automated LinkedIn profile search
- Confidence scoring (HIGH, MEDIUM, LOW, NO)
- Results export to CSV

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

4. **Start the application:**
   ```bash
   npm run dev:full
   ```

   This will start both:
   - React frontend on http://localhost:8080
   - Backend server on http://localhost:5000

5. **Open the application:**
   Navigate to http://localhost:8080 in your browser

### Usage

1. **Enter Data:**
   - Upload a CSV file with Email and Name columns
   - Or manually enter data in the text area

2. **Enter LinkedIn Credentials:**
   - Provide your LinkedIn email and password
   - Credentials are only used for this session

3. **Start Matching:**
   - Click "Start Matching" to begin processing
   - Watch progress in the status panel

4. **View Results:**
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

- **Chrome not found:** Make sure Google Chrome is installed
- **Python errors:** Ensure Python 3.6+ is installed and in PATH
- **Port conflicts:** Change ports in server.js and vite.config.ts if needed