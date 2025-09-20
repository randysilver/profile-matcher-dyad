# LinkedIn Profile Matcher

A Python application that reads email addresses from a CSV file and prepares them for LinkedIn profile matching.

## Features

- Reads email addresses and optional names from CSV input
- Creates structured output CSV with LinkedIn profile fields
- Resume capability - skips already processed entries
- Progress tracking and logging
- Error handling for file operations

## Requirements

- Python 3.6+

## Usage

1. Create an input CSV file named `input_emails.csv` with at least an "Email" column
2. Optionally include a "Name" column
3. Run the application:
   ```
   python linkedin_matcher.py
   ```
4. Results will be saved to `linkedin_results.csv`

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
- LinkedIn_URL: LinkedIn profile URL (to be filled by matching logic)
- LinkedIn_Name: Name from LinkedIn profile (to be filled by matching logic)
- Job_Title: Job title from LinkedIn (to be filled by matching logic)
- Company: Company from LinkedIn (to be filled by matching logic)
- Confidence_Level: Confidence level of match (to be filled by matching logic)
- Status: Processing status (Pending, Completed, Failed, etc.)

## Resume Capability

The application automatically detects already processed emails in the output file and skips them, allowing you to resume processing after interruptions.

## Logging

All operations are logged to both the console and `linkedin_matcher.log` file.