# LinkedIn Profile Matcher

A web application that simulates finding and matching LinkedIn profiles with email addresses.

## Features

- Browser-based interface - no server required
- Upload CSV files or enter data manually
- Simulated LinkedIn profile search with realistic timing
- Confidence scoring (HIGH, MEDIUM, LOW, NO)
- Results export to CSV
- Real-time console for monitoring

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate to http://localhost:8080 in your browser

## Usage

1. **Enter Data:**
   - Upload a CSV file with Email and Name columns
   - Or manually enter data in the text area

2. **Enter LinkedIn Credentials (simulated):**
   - Provide any email and password (not actually used)
   - This is simulated for demonstration purposes

3. **Start Matching:**
   - Click "Start Matching" to begin simulated processing
   - Watch progress in the status panel and console

4. **View Results:**
   - Results will appear in the results panel
   - Download results as CSV when complete

## File Format

Input CSV should have this format:
```csv
Email,Name
john.doe@example.com,John Doe
jane.smith@example.com,Jane Smith
```

## Demo Mode Notice

This is a demonstration version that simulates LinkedIn profile matching. In a production environment, this would:

1. Use actual LinkedIn API integration
2. Perform real profile searches
3. Require proper authentication
4. Connect to a backend server for processing

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service like:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

## Technical Details

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Static files (no server required)

## Security Note

This demo version does not actually use LinkedIn credentials. In a real implementation, proper security measures would be required for handling sensitive data.