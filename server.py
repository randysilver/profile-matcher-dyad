from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import threading
import os
import json
from typing import Dict, Any

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global variables to track processing status
processing_status = {
    "is_processing": False,
    "progress": 0,
    "total_records": 0,
    "processed_records": 0,
    "current_email": "",
    "current_status": "idle"
}

def run_linkedin_matcher():
    """Run the LinkedIn matcher script and update status."""
    global processing_status
    
    try:
        processing_status["is_processing"] = True
        processing_status["status"] = "starting"
        
        # Run the Python script
        process = subprocess.Popen(
            ["python", "linkedin_matcher.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Read output line by line and update status
        for line in process.stdout:
            print(line.strip())
            
            # Parse progress updates from the logs
            if "Processing" in line and "/" in line:
                parts = line.split()
                for part in parts:
                    if "/" in part:
                        processed, total = part.split("/")
                        processing_status["processed_records"] = int(processed)
                        processing_status["total_records"] = int(total)
                        processing_status["progress"] = (int(processed) / int(total)) * 100
                        
            elif "Progress:" in line:
                progress_part = line.split("Progress:")[1].split("%")[0].strip()
                processing_status["progress"] = float(progress_part)
                
            elif "Processing" in line and "@" in line:
                email_part = line.split("Processing")[1].split(":")[1].strip()
                processing_status["current_email"] = email_part
        
        process.wait()
        
        if process.returncode == 0:
            processing_status["status"] = "completed"
        else:
            processing_status["status"] = "failed"
            
    except Exception as e:
        processing_status["status"] = f"error: {str(e)}"
    finally:
        processing_status["is_processing"] = False

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current processing status."""
    return jsonify(processing_status)

@app.route('/api/start', methods=['POST'])
def start_processing():
    """Start the LinkedIn matching process."""
    global processing_status
    
    if processing_status["is_processing"]:
        return jsonify({"error": "Processing already in progress"}), 400
    
    # Start processing in a separate thread
    thread = threading.Thread(target=run_linkedin_matcher)
    thread.daemon = True
    thread.start()
    
    return jsonify({"message": "Processing started"})

@app.route('/api/stop', methods=['POST'])
def stop_processing():
    """Stop the processing (not implemented fully)."""
    global processing_status
    processing_status["is_processing"] = False
    return jsonify({"message": "Stop signal sent"})

@app.route('/api/results', methods=['GET'])
def get_results():
    """Get the results from the output CSV."""
    try:
        if not os.path.exists("linkedin_results.csv"):
            return jsonify({"error": "No results file found"})
        
        import csv
        results = []
        with open("linkedin_results.csv", 'r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                results.append(row)
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')