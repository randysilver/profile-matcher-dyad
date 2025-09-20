// Service to handle LinkedIn matching via backend API
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

const API_BASE_URL = 'http://localhost:5000/api';

export const linkedinService = {
  // Start processing
  async startProcessing(emailData: string, linkedinEmail: string, linkedinPassword: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailData,
          linkedinEmail,
          linkedinPassword
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting processing:', error);
      throw error;
    }
  },

  // Get processing status
  async getProcessingStatus(): Promise<ProcessingStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting status:', error);
      return {
        isProcessing: false,
        progress: 0,
        totalRecords: 0,
        processedRecords: 0,
        currentEmail: "",
        status: "error"
      };
    }
  },

  // Stop processing
  async stopProcessing() {
    try {
      const response = await fetch(`${API_BASE_URL}/stop`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error stopping processing:', error);
      throw error;
    }
  },

  // Get results
  async getResults(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/results`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting results:', error);
      throw error;
    }
  }
};