# Grammar & Spell Checker Web Application

A Flask-based web application that provides intelligent grammar and spell checking using NLP tools. The application features rate limiting, text validation, and a clean Bootstrap-powered interface.

## Features

-  **Spell Correction**: Automatic spell checking using TextBlob
- **Grammar Correction**: Advanced grammar checking with LanguageTool
-  **Rate Limiting**: Built-in IP-based rate limiting (10 requests per 60 seconds)
-  **Text Validation**: Maximum text length of 2000 characters
-  **Modern UI**: Clean Bootstrap 5 interface with real-time character counter
-  **Real-time Processing**: Instant correction results
-  **Error Handling**: Comprehensive error handling and user feedback

## Prerequisites

- Python 3.8 or higher
- Java (optional, but recommended for local LanguageTool instance)
- pip (Python package manager)

## Installation

### 1. Clone or Navigate to the Project Directory

```bash
cd /path/to/speach
```

### 2. Create a Virtual Environment

```bash
python3 -m venv .venv
```

### 3. Activate the Virtual Environment

**macOS/Linux:**
```bash
source .venv/bin/activate
```

**Windows:**
```bash
.venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** If you're using Python 3.13+, you may need to install setuptools:
```bash
pip install setuptools
```

## Running the Application

### Start the Server

```bash
python app.py
```

The application will start on `http://127.0.0.1:5000`

You should see output similar to:
```
============================================================
  Grammar & Spell Checker Web Application
============================================================
  Starting server on http://127.0.0.1:5000
  Rate limit: 10 requests per 60 seconds
  Max text length: 2000 characters
============================================================
```

### Access the Application

Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

### Stop the Server

Press `Ctrl + C` in the terminal where the server is running.

## Usage

### Web Interface

1. Enter or paste your text into the textarea
2. Click the **"Correct"** button
3. View the results:
   - **Original Text**: Your input text
   - **Spell Corrected**: Text with spelling corrections only
   - **Fully Corrected**: Text with both spelling and grammar corrections

### API Endpoint

**Endpoint:** `POST /api/correct`

**Request:**
```json
{
  "text": "Your text to corrct here"
}
```

**Response:**
```json
{
  "original": "Your text to corrct here",
  "spell_version": "Your text to correct here",
  "corrected": "Your text to correct here."
}
```

**Example using curl:**
```bash
curl -X POST http://127.0.0.1:5000/api/correct \
  -H "Content-Type: application/json" \
  -d '{"text": "I has a dream"}'
```

## Configuration

You can modify the following settings in `app.py`:

| Setting | Default | Description |
|---------|---------|-------------|
| `RATE_LIMIT_REQUESTS` | 10 | Maximum requests per time window |
| `RATE_LIMIT_WINDOW` | 60 | Time window in seconds |
| `MAX_TEXT_LENGTH` | 2000 | Maximum characters allowed |
| `PORT` | 5000 | Server port |
| `HOST` | 127.0.0.1 | Server host |

## Project Structure

```
speach/
├── app.py                 # Flask application and API endpoints
├── Model.py              # NLP model for correction logic
├── requirements.txt      # Python dependencies
├── templates/
│   └── index.html       # Web interface
└── .venv/               # Virtual environment (created during setup)
```

## Dependencies

- **Flask 3.0.0** - Web framework
- **textblob 0.17.1** - Spell checking
- **language-tool-python 2.8.1** - Grammar checking
- **setuptools** - Required for Python 3.13+ compatibility

## Troubleshooting

### Java Not Detected

If you see warnings about Java not being detected:
- **Install Java**: Download and install Java JDK from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use OpenJDK
- **Alternative**: The application will automatically fall back to using a remote LanguageTool server

### ModuleNotFoundError: No module named 'flask'

Make sure you've:
1. Activated the virtual environment
2. Installed all dependencies with `pip install -r requirements.txt`

### ModuleNotFoundError: No module named 'distutils'

For Python 3.13+, install setuptools:
```bash
pip install setuptools
```

### Rate Limit Exceeded

If you see "Rate limit exceeded" errors:
- Wait 60 seconds before making another request
- Or adjust `RATE_LIMIT_REQUESTS` in `app.py`

## Development

### Debug Mode

The application runs in debug mode by default, which:
- Auto-reloads on code changes
- Provides detailed error messages
- Enables the Flask debugger

**For production deployment**, set `debug=False` in `app.py`:
```python
app.run(debug=False, host='0.0.0.0', port=5000)
```

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check the troubleshooting section above or review the code comments in `app.py` and `Model.py`.
