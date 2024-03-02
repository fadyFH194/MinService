# app.py
from API import create_app
from flask_cors import CORS
from flask_cors import CORS

if __name__ == "__main__":
    app = create_app()

    # Enable CORS for all domains on all routes
    CORS(app)

    app.run(debug=True, port=5000)
