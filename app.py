"""
Flask Web Application for Grammar and Spell Checking
Provides REST API endpoints with rate limiting and text validation
"""

from flask import Flask, request, jsonify, render_template
from Model import NLPModel
from datetime import datetime, timedelta
from collections import defaultdict
import threading

# Initialize Flask app
app = Flask(__name__)

# Initialize NLP Model
nlp_model = NLPModel()

# Rate limiting configuration
RATE_LIMIT_REQUESTS = 10  # Maximum requests per window
RATE_LIMIT_WINDOW = 60  # Time window in seconds
MAX_TEXT_LENGTH = 2000  # Maximum character limit for input text

# In-memory rate limiting storage: {ip_address: [(timestamp1, timestamp2, ...)]}
rate_limit_storage = defaultdict(list)
rate_limit_lock = threading.Lock()


def check_rate_limit(ip_address):
    """
    Check if the IP address has exceeded the rate limit
    
    Args:
        ip_address (str): Client IP address
        
    Returns:
        tuple: (is_allowed, remaining_requests)
            - is_allowed (bool): True if request is allowed, False if rate limited
            - remaining_requests (int): Number of requests remaining in current window
    """
    try:
        with rate_limit_lock:
            current_time = datetime.now()
            cutoff_time = current_time - timedelta(seconds=RATE_LIMIT_WINDOW)
            
            # Get request timestamps for this IP
            timestamps = rate_limit_storage[ip_address]
            
            # Remove timestamps outside the current window
            timestamps[:] = [ts for ts in timestamps if ts > cutoff_time]
            
            # Check if limit exceeded
            if len(timestamps) >= RATE_LIMIT_REQUESTS:
                return (False, 0)
            
            # Add current request timestamp
            timestamps.append(current_time)
            
            remaining = RATE_LIMIT_REQUESTS - len(timestamps)
            return (True, remaining)
    
    except Exception as e:
        print(f"⚠ Rate limit check error: {str(e)}")
        # On error, allow the request (fail-open)
        return (True, RATE_LIMIT_REQUESTS)


@app.route('/')
def index():
    """
    Serve the main HTML page
    
    Returns:
        HTML: Rendered index.html template
    """
    try:
        return render_template('index.html')
    except Exception as e:
        print(f"✗ Error serving index.html: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/correct', methods=['POST'])
def correct_text():
    """
    API endpoint to correct text (spell and grammar)
    
    Expected JSON input:
        {
            "text": "text to correct"
        }
    
    Returns:
        JSON response with original, spell-corrected, and fully corrected text
    """
    try:
        # Get client IP address
        client_ip = request.remote_addr
        
        # Check rate limit
        is_allowed, remaining = check_rate_limit(client_ip)
        if not is_allowed:
            return jsonify({
                "error": "Rate limit exceeded. Please try again later."
            }), 429
        
        # Get JSON data
        data = request.get_json()
        
        # Validate request data
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
        
        if 'text' not in data:
            return jsonify({"error": "Missing 'text' field in request"}), 400
        
        text = data['text']
        
        # Validate text type
        if not isinstance(text, str):
            return jsonify({"error": "Text must be a string"}), 400
        
        # Check text length
        if len(text) > MAX_TEXT_LENGTH:
            return jsonify({
                "error": f"Text too long. Maximum {MAX_TEXT_LENGTH} characters allowed."
            }), 413
        
        # Check for empty text
        if not text.strip():
            return jsonify({
                "original": text,
                "spell_version": text,
                "corrected": text
            }), 200
        
        # Perform correction
        spell_version, corrected = nlp_model.correct(
            text, 
            do_spell=True, 
            do_grammar=True
        )
        
        # Return results
        response = {
            "original": text,
            "spell_version": spell_version,
            "corrected": corrected
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"✗ API error: {str(e)}")
        return jsonify({
            "error": "An error occurred while processing your request. Please try again."
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("  Grammar & Spell Checker Web Application")
    print("="*60)
    print(f"  Starting server on http://127.0.0.1:5000")
    print(f"  Rate limit: {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds")
    print(f"  Max text length: {MAX_TEXT_LENGTH} characters")
    print("="*60 + "\n")
    
    try:
        app.run(debug=True, host='127.0.0.1', port=5000)
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped gracefully")
        nlp_model.close()
    except Exception as e:
        print(f"\n✗ Server error: {str(e)}")
        nlp_model.close()
