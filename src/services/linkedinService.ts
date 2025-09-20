// Browser-only service that simulates LinkedIn matching
// This avoids the need for a separate backend server

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

// Simulate LinkedIn matching with realistic delays
export const linkedinService = {
  async startProcessing(emailData: string, linkedinEmail: string, linkedinPassword: string) {
    // Validate credentials (simulated)
    if (!linkedinEmail || !linkedinPassword) {
      throw new Error("LinkedIn credentials are required");
    }

    // Parse email data
    const records = this.parseEmailData(emailData);
    if (records.length === 0) {
      throw new Error("No valid email records found");
    }

    // Simulate processing - in a real app, this would call a backend
    return { success: true, message: "Processing started", totalRecords: records.length };
  },

  async getProcessingStatus(): Promise<ProcessingStatus> {
    // Simulate status updates
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
    // Simulate stop processing
    return { success: true, message: "Processing stopped" };
  },

  async getResults(): Promise<string> {
    // Return sample results in CSV format
    return `Email,Name,LinkedIn_URL,LinkedIn_Name,Job_Title,Company,Confidence_Level,Status
john.doe@example.com,John Doe,https://linkedin.com/in/johndoe,John Doe,Product Manager,Tech Corp,HIGH,Found
jane.smith@example.com,Jane Smith,https://linkedin.com/in/janesmith,Jane Smith,Senior Product Manager,Innovate Inc,HIGH,Found
mike.johnson@example.com,Mike Johnson,https://linkedin.com/in/mikejohnson,Mike Johnson,Software Engineer,Code Labs,LOW,Found
sarah.williams@example.com,Sarah Williams,,Sarah Williams,,,NO,Not Found`;
  },

  parseEmailData(emailData: string): Array<{email: string; name: string}> {
    if (!emailData.trim()) return [];
    
    const lines = emailData.trim().split('\n');
    const records: Array<{email: string; name: string}> = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Skip header row if it exists
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

  // Simulate actual LinkedIn processing with realistic timing
  async simulateLinkedInProcessing(emailData: string, onProgress: (progress: number, current: string) => void): Promise<LinkedInResult[]> {
    const records = this.parseEmailData(emailData);
    const results: LinkedInResult[] = [];
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const progress = Math.round((i / records.length) * 100);
      
      // Update progress
      onProgress(progress, record.email);
      
      // Simulate network delay (2-5 seconds per record)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      // Generate realistic results
      const result = this.generateResult(record);
      results.push(result);
    }
    
    return results;
  },

  generateResult(record: {email: string; name: string}): LinkedInResult {
    const domains = ['techcorp.com', 'innovateinc.com', 'codelabs.io', 'productco.com'];
    const companies = ['Tech Corp', 'Innovate Inc', 'Code Labs', 'Product Co'];
    const titles = ['Product Manager', 'Senior Product Manager', 'Product Owner', 'Software Engineer', 'UX Designer'];
    
    const hasLinkedIn = Math.random() > 0.3; // 70% chance of finding a profile
    const isProductRole = Math.random() > 0.5; // 50% chance of product role
    
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
    
    // Determine confidence level
    let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    const emailDomain = record.email.split('@')[1];
    
    if (emailDomain === domains[domainIndex] && isProductRole) {
      confidence = "HIGH";
    } else if (emailDomain === domains[domainIndex] || isProductRole) {
      confidence = "MEDIUM";
    }
    
    return {
      Email: record.email,
      Name: record.name,
      LinkedIn_URL: `https://linkedin.com/in/${record.email.split('@')[0]}`,
      LinkedIn_Name: record.name || `User ${record.email.split('@')[0]}`,
      Job_Title: title,
      Company: company,
      Confidence_Level: confidence,
      Status: "Found"
    };
  }
};