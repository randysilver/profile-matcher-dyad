# LinkedIn Profile Matcher

A Python application that reads email addresses from a CSV file and searches for matching LinkedIn profiles.

## Features

- Reads email addresses and optional names from CSV input
- Creates structured output CSV with LinkedIn profile fields
- LinkedIn authentication with Selenium WebDriver
- Profile search functionality
- Resume capability - skips already processed entries
- Progress tracking and logging
- Error handling for file operations and LinkedIn interactions

## Requirements

- Python 3.6+
- Chrome browser installed
- LinkedIn account credentials

## Installation

1. Install required packages:
```bash
pip install -r requirements.txt
```

## Usage

1. Create an input CSV file named `input_emails.csv` with at least an "Email" column
2. Optionally include a "Name" column
3. Run the application:
```bash
python linkedin_matcher.py
```
4. Enter your LinkedIn credentials when prompted
5. Results will be saved to `linkedin_results.csv`

### Environment Variables (Optional)

You can set LinkedIn credentials as environment variables:
```bash
export LINKEDIN_EMAIL="your_email@example.com"
export LINKEDIN_PASSWORD="your_password"
```

## Input File Format

The input CSV must contain at least an "Email" column. It can optionally include a "Name" column:

```csv
Email,Name
john.doe@example.com,John Doe
jane.smith@example.com,Jane Smith
```

## Output File Format

The output CSV will contain the following columns:
- Email: The email address from input
- Name: The name from input (if provided)
- LinkedIn_URL: LinkedIn profile URL
- LinkedIn_Name: Name from LinkedIn profile
- Job_Title: Job title from LinkedIn
- Company: Company from LinkedIn
- Confidence_Level: Confidence level of match
- Status: Processing status (Found, Not Found, Error, etc.)

## Important Notes

- The application uses Selenium WebDriver for browser automation
- Chrome browser must be installed on your system
- LinkedIn may show CAPTCHA or require additional verification
- Use responsibly and respect LinkedIn's terms of service
- The application includes delays to avoid rate limiting

## Resume Capability

The application automatically detects already processed emails in the output file and skips them, allowing you to resume processing after interruptions.

## Logging

All operations are logged to both the console and `linkedin_matcher.log` file.

## Troubleshooting

If you encounter issues:
1. Make sure Chrome browser is installed
2. Check your LinkedIn credentials
3. Run with headless=False for debugging
4. Check the log file for detailed error messages