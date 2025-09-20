import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { showSuccess, showError } from "@/utils/toast";
import { Play, Stop, Upload, Download } from "lucide-react";
import { linkedinService, LinkedInResult } from "@/services/linkedinService";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [processedRecords, setProcessedRecords] = useState(0);
  const [emailData, setEmailData] = useState("");
  const [linkedinEmail, setLinkedinEmail] = useState("");
  const [linkedinPassword, setLinkedinPassword] = useState("");
  const [results, setResults] = useState<LinkedInResult[]>([]);
  const [status, setStatus] = useState("idle");

  // Parse CSV data to count records
  const parseCSVData = (csvText: string) => {
    if (!csvText.trim()) return 0;
    const lines = csvText.trim().split('\n');
    // Subtract 1 for header row
    return Math.max(0, lines.length - 1);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setEmailData(content);
        setTotalRecords(parseCSVData(content));
        showSuccess(`Loaded ${parseCSVData(content)} records from file`);
      };
      reader.readAsText(file);
    }
  };

  // Handle manual data input
  const handleDataChange = (value: string) => {
    setEmailData(value);
    setTotalRecords(parseCSVData(value));
  };

  // Poll for status updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isProcessing) {
      interval = setInterval(async () => {
        try {
          const status = await linkedinService.getProcessingStatus();
          setProgress(status.progress);
          setProcessedRecords(status.processedRecords);
          setTotalRecords(status.totalRecords);
          setStatus(status.status);
          
          if (!status.isProcessing) {
            setIsProcessing(false);
            if (status.status === "completed") {
              showSuccess("Processing completed successfully!");
              // Fetch results
              try {
                const resultsData = await linkedinService.getResults();
                // Parse CSV results (simplified)
                const lines = resultsData.split('\n').filter(line => line.trim());
                if (lines.length > 1) {
                  const headers = lines[0].split(',');
                  const resultsArray: LinkedInResult[] = [];
                  
                  for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',');
                    const result: any = {};
                    headers.forEach((header, index) => {
                      result[header.trim()] = values[index] ? values[index].replace(/"/g, '') : '';
                    });
                    resultsArray.push(result as LinkedInResult);
                  }
                  
                  setResults(resultsArray);
                }
              } catch (error) {
                console.error('Error fetching results:', error);
              }
            } else if (status.status === "failed") {
              showError("Processing failed. Please check the logs.");
            }
          }
        } catch (error) {
          console.error('Error fetching status:', error);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing]);

  // Start processing
  const handleStartProcessing = async () => {
    if (!emailData.trim()) {
      showError("Please provide email data");
      return;
    }

    if (!linkedinEmail || !linkedinPassword) {
      showError("Please enter LinkedIn credentials");
      return;
    }

    try {
      await linkedinService.startProcessing(emailData, linkedinEmail, linkedinPassword);
      setIsProcessing(true);
      setProgress(0);
      setProcessedRecords(0);
      setStatus("starting");
      showSuccess("Starting LinkedIn profile matching...");
    } catch (error) {
      showError("Failed to start processing. Please check the console for details.");
      setStatus("failed");
    }
  };

  // Stop processing
  const handleStopProcessing = async () => {
    try {
      await linkedinService.stopProcessing();
      setIsProcessing(false);
      setStatus("stopped");
      showSuccess("Processing stopped");
    } catch (error) {
      showError("Failed to stop processing");
    }
  };

  // Download results
  const handleDownloadResults = () => {
    if (results.length === 0) {
      showError("No results to download");
      return;
    }

    // Convert results to CSV
    const headers = Object.keys(results[0]).join(",");
    const rows = results.map(row => 
      Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedin_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess("Results downloaded successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            LinkedIn Profile Matcher
          </h1>
          <p className="text-lg text-gray-600">
            Find and match LinkedIn profiles with email addresses directly in your browser
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Data</CardTitle>
                <CardDescription>
                  Enter email addresses to match with LinkedIn profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload CSV File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Or Enter Data Manually</Label>
                  <Textarea
                    placeholder="Email,Name&#10;john.doe@example.com,John Doe&#10;jane.smith@example.com,Jane Smith"
                    value={emailData}
                    onChange={(e) => handleDataChange(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Format: Email,Name (one per line)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>LinkedIn Credentials</CardTitle>
                <CardDescription>
                  Enter your LinkedIn login information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin-email">Email</Label>
                  <Input
                    id="linkedin-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={linkedinEmail}
                    onChange={(e) => setLinkedinEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin-password">Password</Label>
                  <Input
                    id="linkedin-password"
                    type="password"
                    placeholder="Your LinkedIn password"
                    value={linkedinPassword}
                    onChange={(e) => setLinkedinPassword(e.target.value)}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p className="font-medium">Security Note:</p>
                  <p>Credentials are only used for this session and not stored.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Controls & Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Controls</CardTitle>
                <CardDescription>
                  Start or stop the profile matching process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleStartProcessing}
                    disabled={isProcessing || !emailData.trim() || !linkedinEmail || !linkedinPassword}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Start Matching"}
                  </Button>
                  <Button 
                    onClick={handleStopProcessing}
                    disabled={!isProcessing}
                    variant="destructive"
                  >
                    <Stop className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progress">Progress</Label>
                  <Progress value={progress} className="w-full" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{processedRecords} of {totalRecords} records</span>
                    <span>{progress}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="p-3 rounded-md bg-gray-100">
                    <p className="font-medium capitalize">{status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>
                  How to use this application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">1</div>
                  <div>
                    <p className="font-medium">Upload or enter email data</p>
                    <p className="text-sm text-gray-600">CSV format with Email and Name columns</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">2</div>
                  <div>
                    <p className="font-medium">Enter LinkedIn credentials</p>
                    <p className="text-sm text-gray-600">Used only for this session</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">3</div>
                  <div>
                    <p className="font-medium">Start matching</p>
                    <p className="text-sm text-gray-600">Results will appear below</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
                <div>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>
                    Matched LinkedIn profiles
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleDownloadResults}
                  disabled={results.length === 0}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardHeader>
              <CardContent>
                {results.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Showing {results.length} of {totalRecords} results
                    </div>
                    <div className="border rounded-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">Confidence</th>
                              <th className="text-left p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.map((result, index) => (
                              <tr key={index} className="border-t">
                                <td className="p-2">{result.Name || result.Email}</td>
                                <td className="p-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    result.Confidence_Level === "HIGH" 
                                      ? "bg-green-100 text-green-800" 
                                      : result.Confidence_Level === "MEDIUM" 
                                        ? "bg-yellow-100 text-yellow-800" 
                                        : result.Confidence_Level === "LOW" 
                                          ? "bg-orange-100 text-orange-800" 
                                          : "bg-red-100 text-red-800"
                                  }`}>
                                    {result.Confidence_Level}
                                  </span>
                                </td>
                                <td className="p-2">
                                  <span className="text-xs text-gray-600">{result.Status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No results yet. Start processing to see matched profiles.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  What this application can do
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">CSV Processing</p>
                    <p className="text-sm text-gray-600">Upload or manually enter email data</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">LinkedIn Integration</p>
                    <p className="text-sm text-gray-600">Automated profile search</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">Confidence Scoring</p>
                    <p className="text-sm text-gray-600">HIGH, MEDIUM, LOW, NO confidence levels</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">Results Export</p>
                    <p className="text-sm text-gray-600">Download results as CSV</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Made with Dyad footer */}
        <div className="mt-8">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );
};

export default Index;