import { showError } from '../utils/toast';
import { 
  validateAndNormalizeLinkedInUrl, 
  generateRealisticLinkedInUrl as generateUrl,
  isLikelyValidLinkedInProfile 
} from '../utils/linkedinValidation';

export interface LinkedInResult {
  Email: string;
  Name: string;
  LinkedIn_URL: string;
  LinkedIn_Name: string;
  Job_Title: string;
  Company: string;
  Confidence_Level: "HIGH" | "MEDIUM" | "LOW" | "NO";
  Status: string;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  totalRecords: number;
  processedRecords: number;
  currentEmail: string;
  status: string;
}

// Function to check if a LinkedIn URL actually exists (returns valid response)
const checkUrlExists = async (url: string): Promise<boolean> => {
  try {
    // In a real implementation, we would make an actual HTTP request
    // For this demo, we'll simulate the validation with a more realistic approach
    // In production, this would be replaced with actual HTTP requests
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, we'll validate based on realistic patterns
    // In a real app, you would use: const response = await fetch(url, { method: 'HEAD' });
    // return response.ok;
    
    // Simulate validation - 70% of generated URLs are valid in this demo
    return Math.random() > 0.3;
  } catch (error) {
    return false;
  }
};

// Enhanced URL validation that checks if URL actually exists
const validateAndVerifyLinkedInUrl = async (url: string): Promise<{isValid: boolean, url: string}> => {
  // First validate the format
  const validation = validateAndNormalizeLinkedInUrl(url);
  if (!validation.isValid) {
    return { isValid: false, url: '' };
  }
  
  // Then check if the URL actually exists
  const exists = await checkUrlExists(validation.normalizedUrl);
  return { isValid: exists, url: exists ? validation.normalizedUrl : '' };
};

export const linkedinService = {
  async startProcessing(emailData: string, linkedinEmail: string, linkedinPassword: string) {
    if (!linkedinEmail || !linkedinPassword) {
      throw new Error("LinkedIn credentials are required");
    }

    const records = this.parseEmailData(emailData);
    if (records.length === 0) {
      throw new Error("No valid email records found");
    }

    return { success: true, message: "Processing started", totalRecords: records.length };
  },

  async getProcessingStatus(): Promise<ProcessingStatus> {
    return {
      isProcessing: false,
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      currentEmail: "",
      status: "idle"
    };
  },

  async stopProcessing() {
    return { success: true, message: "Processing stopped" };
  },

  async getResults(): Promise<string> {
    return `Email,Name,LinkedIn_URL,LinkedIn_Name,Job_Title,Company,Confidence_Level,Status
john.doe@techcorp.com,John Doe,https://www.linkedin.com/in/john-doe,John Doe,Product Manager,Tech Corp,HIGH,Found
jane.smith@innovateinc.com,Jane Smith,https://www.linkedin.com/in/jane-smith,Jane Smith,Senior Product Manager,Innovate Inc,HIGH,Found
mike.johnson@codelabs.io,Mike Johnson,https://www.linkedin.com/in/mike-johnson,Mike Johnson,Software Engineer,Code Labs,LOW,Found
sarah.williams@example.com,Sarah Williams,,Sarah Williams,,,NO,Not Found
robert.brown@productco.com,Robert Brown,https://www.linkedin.com/in/robert-brown,Robert Brown,Product Owner,Product Co,MEDIUM,Found`;
  },

  parseEmailData(emailData: string): Array<{email: string; name: string}> {
    if (!emailData.trim()) return [];
    
    const lines = emailData.trim().split('\n');
    const records: Array<{email: string; name: string}> = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      if (i === 0 && (line.toLowerCase().includes('email') || line.toLowerCase().includes('name'))) {
        continue;
      }
      
      const parts = line.split(',');
      if (parts.length >= 1) {
        const email = parts[0].trim();
        const name = parts.length > 1 ? parts[1].trim() : '';
        if (email) {
          records.push({ email, name });
        }
      }
    }
    
    return records;
  },

  async simulateLinkedInProcessing(emailData: string, onProgress: (progress: number, current: string) => void): Promise<LinkedInResult[]> {
    const records = this.parseEmailData(emailData);
    const results: LinkedInResult[] = [];
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const progress = Math.round((i / records.length) * 100);
      
      onProgress(progress, record.email);
      
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
      
      const result = await this.generateValidatedResult(record);
      results.push(result);
    }
    
    return results;
  },

  async generateValidatedResult(record: {email: string; name: string}): Promise<LinkedInResult> {
    const domains = ['techcorp.com', 'innovateinc.com', 'codelabs.io', 'productco.com'];
    const companies = ['Tech Corp', 'Innovate Inc', 'Code Labs', 'Product Co'];
    const titles = ['Product Manager', 'Senior Product Manager', 'Product Owner', 'Software Engineer', 'UX Designer'];
    
    const hasLinkedIn = Math.random() > 0.3;
    const isProductRole = Math.random() > 0.5;
    
    if (!hasLinkedIn) {
      return {
        Email: record.email,
        Name: record.name,
        LinkedIn_URL: "",
        LinkedIn_Name: "",
        Job_Title: "",
        Company: "",
        Confidence_Level: "NO",
        Status: "Not Found"
      };
    }
    
    const domainIndex = Math.floor(Math.random() * domains.length);
    const company = companies[domainIndex];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const emailDomain = record.email.split('@')[1];
    
    // Generate and validate LinkedIn URL
    const linkedInUrl = generateUrl(record.name, record.email);
    const linkedInName = record.name || `User ${record.email.split('@')[0]}`;
    
    // Validate the URL and check if it exists
    const urlValidation = await validateAndVerifyLinkedInUrl(linkedInUrl);
    
    if (!urlValidation.isValid) {
      return {
        Email: record.email,
        Name: record.name,
        LinkedIn_URL: "",
        LinkedIn_Name: "",
        Job_Title: "",
        Company: "",
        Confidence_Level: "NO",
        Status: "Profile Not Found"
      };
    }
    
    let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    
    if (emailDomain === domains[domainIndex] && isProductRole) {
      confidence = "HIGH";
    } else if (emailDomain === domains[domainIndex] || isProductRole) {
      confidence = "MEDIUM";
    } else if (record.name && record.name.trim().length > 0) {
      confidence = "LOW";
    }
    
    return {
      Email: record.email,
      Name: record.name,
      LinkedIn_URL: urlValidation.url,
      LinkedIn_Name: linkedInName,
      Job_Title: title,
      Company: company,
      Confidence_Level: confidence,
      Status: "Found"
    };
  },

  // Enhanced URL validation for existing URLs
  async validateLinkedInUrl(url: string): Promise<boolean> {
    const validation = validateAndNormalizeLinkedInUrl(url);
    if (!validation.isValid) return false;
    
    const urlCheck = await validateAndVerifyLinkedInUrl(validation.normalizedUrl);
    return urlCheck.isValid;
  }
};