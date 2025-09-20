import csv
import os
import logging
from typing import List, Dict, Set

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("linkedin_matcher.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Define the output CSV columns
OUTPUT_COLUMNS = [
    "Email", 
    "Name", 
    "LinkedIn_URL", 
    "LinkedIn_Name", 
    "Job_Title", 
    "Company", 
    "Confidence_Level", 
    "Status"
]

def read_input_csv(file_path: str) -> List[Dict[str, str]]:
    """
    Read the input CSV file containing email addresses and optional names.
    
    Args:
        file_path: Path to the input CSV file
        
    Returns:
        List of dictionaries representing each row in the CSV
        
    Raises:
        FileNotFoundError: If the input file doesn't exist
        ValueError: If the CSV format is invalid
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Input file not found: {file_path}")
    
    data = []
    try:
        with open(file_path, 'r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            # Check if required 'Email' column exists
            if 'Email' not in reader.fieldnames:
                raise ValueError("Input CSV must contain an 'Email' column")
            
            for row_num, row in enumerate(reader, start=2):  # Start at 2 since header is row 1
                if not row['Email'].strip():
                    logger.warning(f"Empty email found in row {row_num}, skipping")
                    continue
                    
                data.append({
                    'Email': row['Email'].strip(),
                    'Name': row.get('Name', '').strip() if row.get('Name') else ''
                })
                
        logger.info(f"Successfully read {len(data)} records from {file_path}")
        return data
    
    except Exception as e:
        logger.error(f"Error reading input CSV: {str(e)}")
        raise

def get_processed_emails(output_file: str) -> Set[str]:
    """
    Get set of already processed emails from output file.
    
    Args:
        output_file: Path to the output CSV file
        
    Returns:
        Set of email addresses that have already been processed
    """
    if not os.path.exists(output_file):
        return set()
    
    processed_emails = set()
    try:
        with open(output_file, 'r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                if 'Email' in row and row['Email']:
                    processed_emails.add(row['Email'].strip())
                    
        logger.info(f"Found {len(processed_emails)} already processed emails")
        return processed_emails
    
    except Exception as e:
        logger.error(f"Error reading output CSV for resume capability: {str(e)}")
        return set()

def initialize_output_file(output_file: str):
    """
    Create output CSV file with headers if it doesn't exist.
    
    Args:
        output_file: Path to the output CSV file
    """
    if not os.path.exists(output_file):
        try:
            with open(output_file, 'w', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=OUTPUT_COLUMNS)
                writer.writeheader()
            logger.info(f"Created new output file: {output_file}")
        except Exception as e:
            logger.error(f"Error creating output file: {str(e)}")
            raise

def update_output_file(output_file: str, data: List[Dict[str, str]]):
    """
    Append data to the output CSV file.
    
    Args:
        output_file: Path to the output CSV file
        data: List of dictionaries to write to the file
    """
    try:
        with open(output_file, 'a', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=OUTPUT_COLUMNS)
            writer.writerows(data)
        logger.info(f"Successfully wrote {len(data)} records to {output_file}")
    except Exception as e:
        logger.error(f"Error writing to output file: {str(e)}")
        raise

def process_linkedin_profiles(input_file: str, output_file: str):
    """
    Main function to process LinkedIn profile matching.
    
    Args:
        input_file: Path to the input CSV file
        output_file: Path to the output CSV file
    """
    try:
        # Read input data
        input_data = read_input_csv(input_file)
        
        # Initialize output file if needed
        initialize_output_file(output_file)
        
        # Get already processed emails for resume capability
        processed_emails = get_processed_emails(output_file)
        
        # Filter out already processed emails
        pending_data = [row for row in input_data if row['Email'] not in processed_emails]
        
        if not pending_data:
            logger.info("All emails have already been processed. Nothing to do.")
            return
        
        logger.info(f"Processing {len(pending_data)} new records (skipping {len(input_data) - len(pending_data)} already processed)")
        
        # Process each pending record
        for i, record in enumerate(pending_data, start=1):
            email = record['Email']
            name = record['Name']
            
            logger.info(f"Processing {i}/{len(pending_data)}: {email}")
            
            # This is where the LinkedIn matching logic would go
            # For now, we'll create placeholder data
            output_record = {
                "Email": email,
                "Name": name,
                "LinkedIn_URL": "",  # To be filled by LinkedIn matching logic
                "LinkedIn_Name": "",  # To be filled by LinkedIn matching logic
                "Job_Title": "",  # To be filled by LinkedIn matching logic
                "Company": "",  # To be filled by LinkedIn matching logic
                "Confidence_Level": "",  # To be filled by LinkedIn matching logic
                "Status": "Pending"  # To be updated by LinkedIn matching logic
            }
            
            # Update output file with this record
            update_output_file(output_file, [output_record])
            
            # Log progress
            progress = (i / len(pending_data)) * 100
            logger.info(f"Progress: {progress:.1f}% ({i}/{len(pending_data)})")
        
        logger.info("Processing complete!")
        
    except Exception as e:
        logger.error(f"Error during processing: {str(e)}")
        raise

if __name__ == "__main__":
    # Default file paths
    INPUT_FILE = "input_emails.csv"
    OUTPUT_FILE = "linkedin_results.csv"
    
    try:
        process_linkedin_profiles(INPUT_FILE, OUTPUT_FILE)
    except Exception as e:
        logger.error(f"Application failed: {str(e)}")
        exit(1)