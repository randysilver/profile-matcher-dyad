import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { showSuccess, showError } from "@/utils/toast";
import { Play, Square, Upload, Download } from "lucide-react";
import { linkedinService, LinkedInResult } from "@/services/linkedinService";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [processedRecords, setProcessedRecords] = useState(0);
  const [currentEmail, setCurrentEmail] = useState("");
  const [emailData, setEmailData] = useState("");
  const [linkedinEmail, setLinkedinEmail] = useState("");
  const [linkedinPassword, setLinkedinPassword] = useState("");
  const [results, setResults] = useState<LinkedInResult[]>([]);
  const [status, setStatus] = useState("idle");
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Parse CSV data to count records
  const parseCSVData = (csvText: string) => {
    if (!csvText.trim()) return 0;
    const lines = csvText.trim().split('\n');
    // Subtract 1 for header row if present
    const hasHeader = lines[0].toLowerCase().includes('email') || lines[0].toLowerCase().includes('name');
    return Math.max(0, lines.length - (hasHeader ? 1 : 0));
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

  // Add log message
  const addLog = (message: string, isError: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setErrorLogs(prev => [...prev, logMessage]);
    
    if (isError) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  };

  // Scroll to bottom of console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [errorLogs]);

  // Start processing
  const handleStartProcessing = async () => {
    if (!emailData.trim()) {
      const errorMsg = "Please provide email data";
      addLog(errorMsg, true);
      showError(errorMsg);
      return;
    }

    if (!linkedinEmail || !linkedinPassword) {
      const errorMsg = "Please enter LinkedIn credentials";
      addLog(errorMsg, true);
      showError(errorMsg);
      return;
    }

    try {
      addLog("Starting LinkedIn profile matching...");
      setIsProcessing(true);
      setProgress(0);
      setProcessedRecords(0);
      setStatus("processing");
      setResults([]);
      
      const records = linkedinService.parseEmailData(emailData);
      setTotalRecords(records.length);
      
      // Simulate LinkedIn processing
      const results = await linkedinService.simulateLinkedInProcessing(
        emailData,
        (progress, currentEmail) => {
          setProgress(progress);
          setCurrentEmail(currentEmail);
          setProcessedRecords(Math.floor((progress / 100) * records.length));
        }
      );
      
      setResults(results);
      setStatus("completed");
      addLog("Processing completed successfully!");
      showSuccess("Processing completed successfully!");
    } catch (error: any) {
      const errorMsg = `Failed to process: ${error.message || error}`;
      addLog(errorMsg, true);
      showError("Failed to process. Please check the console for details.");
      setStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Stop processing
  const handleStopProcessing = () => {
    setIsProcessing(false);
    setStatus("stopped");
    addLog("Processing stopped by user");
    showSuccess("Processing stopped");
  };

  // Download results
  const handleDownloadResults = () => {
    if (results.length === 0) {
      const errorMsg = "No results to download";
      addLog(errorMsg, true);
      showError(errorMsg);
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
    
    addLog("Results downloaded successfully!");
    showSuccess("Results downloaded successfully!");
  };

  // Clear console
  const handleClearConsole = () => {
    setErrorLogs([]);
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

        {/* Demo Notice */}
        <div className="mb-6 p-4 rounded-md bg-blue-100 text-blue-800">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="font-medium">Demo Mode</span>
          </div>
          <p className="mt-2 text-sm">
            This is a demonstration version that simulates LinkedIn profile matching.
            In a production environment, this would connect to actual LinkedIn profiles.
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
                  Enter your LinkedIn login information (simulated)
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
                  <p className="font-medium">Note:</p>
                  <p>Credentials are simulated and not actually used in demo mode.</p>
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
                    <Square className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progress">Progress</Label>
                  <Progress value={progress} className="w-full" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{processedRecords} of {totalRecords} records</span>
                    <span>{progress}%</span>
                  </div>
                  {currentEmail && (
                    <div className="text-xs text-gray-500">
                      Current: {currentEmail}
                    </div>
                  )}
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
                    <p className="font-medium">Enter email data</p>
                    <p className="text-sm text-gray-600">Upload CSV or enter manually</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">2</div>
                  <div>
                    <p className="font-medium">Enter credentials</p>
                    <p className="text-sm text-gray-600">Simulated for demo purposes</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">3</div>
                  <div>
                    <p className="font-medium">Start matching</p>
                    <p className="text-sm text-gray-600">Watch simulated results</p>
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
                    Simulated LinkedIn profile matches
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
                    <p>No results yet. Start processing to see simulated matches.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Console</CardTitle>
                  <CardDescription>
                    Application logs and status messages
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleClearConsole}
                  variant="outline"
                  size="sm"
                >
                  Clear
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md h-48 overflow-y-auto font-mono text-sm">
                  {errorLogs.length > 0 ? (
                    <>
                      {errorLogs.map((log, index) => (
                        <div key={index} className="mb-1">
                          {log}
                        </div>
                      ))}
                      <div ref={consoleEndRef} />
                    </>
                  ) : (
                    <div className="text-gray-500">
                      No logs yet. Start processing to see logs here.
                    </div>
                  )}
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