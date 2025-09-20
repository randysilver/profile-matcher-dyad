import csv
import os
import logging
import time
from typing import List, Dict, Set, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

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

class LinkedInMatcher:
    def __init__(self, headless: bool = True):
        """
        Initialize the LinkedIn matcher with Selenium WebDriver.
        
        Args:
            headless: Whether to run browser in headless mode
        """
        self.driver = None
        self.headless = headless
        self.is_logged_in = False
        
    def setup_driver(self):
        """Set up Chrome WebDriver with appropriate options."""
        try:
            chrome_options = Options()
            if self.headless:
                chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # Set user agent to avoid detection
            chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # Remove navigator.webdriver flag
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            logger.info("WebDriver setup completed successfully")
            
        except Exception as e:
            logger.error(f"Failed to setup WebDriver: {str(e)}")
            raise

    def login_to_linkedin(self, email: str, password: str) -> bool:
        """
        Log in to LinkedIn with provided credentials.
        
        Args:
            email: LinkedIn email/username
            password: LinkedIn password
            
        Returns:
            bool: True if login successful, False otherwise
        """
        try:
            logger.info("Attempting to login to LinkedIn...")
            
            # Navigate to LinkedIn login page
            self.driver.get("https://www.linkedin.com/login")
            
            # Wait for login form to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            
            # Enter credentials
            username_field = self.driver.find_element(By.ID, "username")
            password_field = self.driver.find_element(By.ID, "password")
            
            username_field.clear()
            username_field.send_keys(email)
            
            password_field.clear()
            password_field.send_keys(password)
            
            # Click login button
            login_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            login_button.click()
            
            # Wait for login to complete - check for either success or error
            try:
                # Check for successful login (wait for feed page)
                WebDriverWait(self.driver, 15).until(
                    EC.url_contains("linkedin.com/feed")
                )
                logger.info("Login successful!")
                self.is_logged_in = True
                return True
                
            except TimeoutException:
                # Check for login errors
                try:
                    error_element = self.driver.find_element(By.ID, "error-for-password")
                    error_message = error_element.text
                    logger.error(f"Login failed: {error_message}")
                    return False
                    
                except NoSuchElementException:
                    # Check for other error messages
                    try:
                        error_element = self.driver.find_element(By.CLASS_NAME, "alert-error")
                        error_message = error_element.text
                        logger.error(f"Login failed: {error_message}")
                        return False
                    except NoSuchElementException:
                        logger.error("Login failed: Unknown error occurred")
                        return False
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return False

    def search_linkedin_profile(self, email: str, name: str) -> Optional[Dict[str, str]]:
        """
        Search for LinkedIn profile based on email and name.
        
        Args:
            email: Email address to search
            name: Name to search (optional)
            
        Returns:
            Dictionary with profile information or None if not found
        """
        if not self.is_logged_in:
            logger.error("Not logged in to LinkedIn")
            return None
            
        try:
            # Construct search query
            search_query = f"{name} {email}" if name else email
            
            # Navigate to search page
            search_url = f"https://www.linkedin.com/search/results/people/?keywords={search_query.replace(' ', '%20')}"
            self.driver.get(search_url)
            
            # Wait for search results to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "search-results-container"))
            )
            
            # Give some time for results to populate
            time.sleep(2)
            
            # Extract profile results
            profiles = self.extract_search_results()
            
            if profiles:
                # For now, return the first result with basic info
                first_profile = profiles[0]
                return {
                    "LinkedIn_URL": first_profile.get("url", ""),
                    "LinkedIn_Name": first_profile.get("name", ""),
                    "Job_Title": first_profile.get("title", ""),
                    "Company": first_profile.get("company", ""),
                    "Confidence_Level": "Medium",  # Placeholder for confidence calculation
                    "Status": "Found"
                }
            else:
                return {
                    "LinkedIn_URL": "",
                    "LinkedIn_Name": "",
                    "Job_Title": "",
                    "Company": "",
                    "Confidence_Level": "",
                    "Status": "Not Found"
                }
                
        except Exception as e:
            logger.error(f"Search error for {email}: {str(e)}")
            return {
                "LinkedIn_URL": "",
                "LinkedIn_Name": "",
                "Job_Title": "",
                "Company": "",
                "Confidence_Level": "",
                "Status": f"Error: {str(e)}"
            }

    def extract_search_results(self) -> List[Dict[str, str]]:
        """
        Extract profile information from search results.
        
        Returns:
            List of dictionaries with profile information
        """
        profiles = []
        try:
            # Find all profile result elements
            result_elements = self.driver.find_elements(By.CSS_SELECTOR, ".entity-result__item")
            
            for result in result_elements:
                try:
                    # Extract profile URL
                    link_element = result.find_element(By.CSS_SELECTOR, "a.app-aware-link")
                    profile_url = link_element.get_attribute("href")
                    
                    # Extract name
                    name_element = result.find_element(By.CSS_SELECTOR, ".entity-result__title-text a")
                    name = name_element.text.strip()
                    
                    # Extract job title and company
                    subtitle_element = result.find_element(By.CSS_SELECTOR, ".entity-result__primary-subtitle")
                    subtitle_text = subtitle_element.text.strip()
                    
                    # Simple parsing for title and company
                    title_parts = subtitle_text.split(' at ')
                    job_title = title_parts[0] if title_parts else ""
                    company = title_parts[1] if len(title_parts) > 1 else ""
                    
                    profiles.append({
                        "url": profile_url,
                        "name": name,
                        "title": job_title,
                        "company": company
                    })
                    
                except NoSuchElementException:
                    continue
                    
        except Exception as e:
            logger.error(f"Error extracting search results: {str(e)}")
            
        return profiles

    def close(self):
        """Close the WebDriver."""
        if self.driver:
            self.driver.quit()
            logger.info("WebDriver closed")

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

def get_linkedin_credentials() -> tuple:
    """
    Get LinkedIn credentials from user input or environment variables.
    
    Returns:
        tuple: (email, password)
    """
    # Try to get from environment variables first
    linkedin_email = os.environ.get('LINKEDIN_EMAIL')
    linkedin_password = os.environ.get('LINKEDIN_PASSWORD')
    
    if not linkedin_email or not linkedin_password:
        print("\n=== LinkedIn Credentials Required ===")
        print("Please enter your LinkedIn login credentials")
        print("(Credentials are only used for this session and not stored)")
        print("======================================")
        
        linkedin_email = input("LinkedIn Email: ").strip()
        linkedin_password = input("LinkedIn Password: ").strip()
    
    return linkedin_email, linkedin_password

def process_linkedin_profiles(input_file: str, output_file: str):
    """
    Main function to process LinkedIn profile matching.
    
    Args:
        input_file: Path to the input CSV file
        output_file: Path to the output CSV file
    """
    matcher = None
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
        
        # Get LinkedIn credentials
        linkedin_email, linkedin_password = get_linkedin_credentials()
        
        if not linkedin_email or not linkedin_password:
            logger.error("LinkedIn credentials are required")
            return
        
        # Initialize LinkedIn matcher
        matcher = LinkedInMatcher(headless=False)  # Set to False for debugging, True for production
        matcher.setup_driver()
        
        # Login to LinkedIn
        if not matcher.login_to_linkedin(linkedin_email, linkedin_password):
            logger.error("Failed to login to LinkedIn. Exiting.")
            return
        
        # Process each pending record
        for i, record in enumerate(pending_data, start=1):
            email = record['Email']
            name = record['Name']
            
            logger.info(f"Processing {i}/{len(pending_data)}: {email}")
            
            # Search for LinkedIn profile
            profile_info = matcher.search_linkedin_profile(email, name)
            
            if profile_info:
                output_record = {
                    "Email": email,
                    "Name": name,
                    **profile_info
                }
            else:
                output_record = {
                    "Email": email,
                    "Name": name,
                    "LinkedIn_URL": "",
                    "LinkedIn_Name": "",
                    "Job_Title": "",
                    "Company": "",
                    "Confidence_Level": "",
                    "Status": "Search Failed"
                }
            
            # Update output file with this record
            update_output_file(output_file, [output_record])
            
            # Log progress
            progress = (i / len(pending_data)) * 100
            logger.info(f"Progress: {progress:.1f}% ({i}/{len(pending_data)})")
            
            # Add delay to avoid rate limiting
            time.sleep(2)
        
        logger.info("Processing complete!")
        
    except Exception as e:
        logger.error(f"Error during processing: {str(e)}")
        raise
    finally:
        if matcher:
            matcher.close()

if __name__ == "__main__":
    # Default file paths
    INPUT_FILE = "input_emails.csv"
    OUTPUT_FILE = "linkedin_results.csv"
    
    try:
        process_linkedin_profiles(INPUT_FILE, OUTPUT_FILE)
    except Exception as e:
        logger.error(f"Application failed: {str(e)}")
        exit(1)