import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            LinkedIn Profile Matcher
          </h1>
          <p className="text-lg text-gray-600">
            Find and match LinkedIn profiles with email addresses
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
              <CardDescription>
                Follow these steps to match LinkedIn profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Prepare Input File</h3>
                <p className="text-sm text-gray-600">
                  Create a CSV file named <code>input_emails.csv</code> with columns: <strong>Email</strong> and optionally <strong>Name</strong>
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">2. Run the Application</h3>
                <p className="text-sm text-gray-600">
                  Execute the Python script from the command line:
                </p>
                <code className="block bg-gray-100 p-2 rounded text-sm mt-1">
                  python linkedin_matcher.py
                </code>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">3. Check Results</h3>
                <p className="text-sm text-gray-600">
                  Results will be saved to <code>linkedin_results.csv</code> with confidence levels
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Python script ready to run
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-800 font-semibold">Ready</div>
                <div className="text-green-600 text-sm">
                  The LinkedIn matcher script is ready to execute
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Output File</h4>
                <div className="text-sm text-gray-600">
                  <code>linkedin_results.csv</code>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Log File</h4>
                <div className="text-sm text-gray-600">
                  <code>linkedin_matcher.log</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-6">Features</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CSV Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Read email addresses from CSV files and output structured results
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">LinkedIn Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Automated login and profile search using Selenium WebDriver
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Confidence Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Intelligent matching with HIGH, MEDIUM, LOW, and NO confidence levels
                </p>
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