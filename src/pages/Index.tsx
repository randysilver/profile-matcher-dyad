import { useState } from "react";

const Index = () => {
  const [emailData, setEmailData] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            LinkedIn Profile Matcher
          </h1>
          <p className="text-lg text-gray-600">
            Find and match LinkedIn profiles with email addresses
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">How to Use</h2>
          <p className="mb-4">
            This application helps you match email addresses with LinkedIn profiles.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Enter Email Data</label>
            <textarea
              placeholder="Email,Name&#10;john.doe@example.com,John Doe&#10;jane.smith@example.com,Jane Smith"
              value={emailData}
              onChange={(e) => setEmailData(e.target.value)}
              rows={6}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Start Matching
          </button>
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p>Made with Dyad</p>
        </div>
      </div>
    </div>
  );
};

export default Index;