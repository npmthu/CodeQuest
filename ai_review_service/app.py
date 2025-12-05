"""
Main Flask Application
"""
# Load environment variables FIRST, before any other imports
from dotenv import load_dotenv
load_dotenv()

import os
from flask import Flask
from flask_cors import CORS
from routes.code_review import code_review_bp

# Create Flask app
app = Flask(__name__)

# Enable CORS
CORS(app)

# Register blueprints
app.register_blueprint(code_review_bp)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    from utils.response import error_response
    return error_response("Endpoint not found", status_code=404)

@app.errorhandler(500)
def internal_error(error):
    from utils.response import error_response
    return error_response("Internal server error", status_code=500)


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"\n{'='*50}")
    print(f"🚀 AI Code Review Service")
    print(f"{'='*50}")
    print(f"📍 Running on: http://localhost:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"{'='*50}\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)