# Setup Guide

This guide provides detailed instructions for setting up and running the LMStudio Web UI project.

## Prerequisites

### Required Software

- **Docker** (version 20.10 or later)
- **Docker Compose** (version 2.0 or later)
- **LM Studio** (running on your machine or network)

### Optional for Development

- **Node.js** (version 18 or later) - for frontend development
- **Python** (version 3.11 or later) - for backend development
- **Git** - for version control

## Installation Methods

### Method 1: Docker Compose (Recommended)

This is the easiest way to get started and is suitable for both development and production use.

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd lmstudio-web-ui
```

#### 2. Configure Environment

```bash
cd infrastructure
cp env.example .env
```

Edit `.env` if you need to change default ports:
```bash
# Default values
API_PORT=8000
WEB_PORT=5173
```

#### 3. Start the Application

```bash
# From project root
make up

# Or manually:
cd infrastructure
docker compose up -d --build
```

#### 4. Verify Installation

- **Web UI**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/healthz

### Method 2: Local Development

For active development, you can run the frontend and backend separately.

#### Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server (IMPORTANT: Must be run from backend directory)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Critical**: The backend server must be run from the `backend` directory, not the project root. Running from the wrong directory will result in "ModuleNotFoundError: No module named 'app'" errors.

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:5173 and will automatically proxy API requests to the backend.

## LM Studio Configuration

### 1. Start LM Studio

Launch LM Studio and ensure it's running with the OpenAI-compatible API enabled.

### 2. Configure the Web UI

1. Open the web interface at http://localhost:5173
2. Click the settings (⚙️) icon in the top-right
3. Set the LM Studio Base URL:
   - **Local**: `http://127.0.0.1:1234/v1`
   - **LAN**: `http://192.168.1.10:1234/v1` (replace with your LM Studio machine's IP)
4. Click "Refresh Models" to load available models
5. Save your settings

### 3. Load Models in LM Studio

Make sure you have models loaded in LM Studio before using the web interface. The web UI will only show models that are currently loaded in LM Studio.

## Network Configuration

### LAN Access

The application is configured to be accessible across your local network:

- **Frontend**: Binds to `0.0.0.0:5173`
- **Backend**: Binds to `0.0.0.0:8000`
- **CORS**: Configured to allow requests from any origin

### Accessing from Other Devices

1. Find your machine's IP address:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. Access the web UI from other devices:
   ```
   http://YOUR_IP_ADDRESS:5173
   ```

3. Update LM Studio URL in settings to use your machine's IP:
   ```
   http://YOUR_IP_ADDRESS:1234/v1
   ```

## Common Commands

### Docker Commands

```bash
# Start the application
make up

# Stop the application
make down

# View logs
make logs

# Rebuild and restart
make rebuild

# View specific service logs
docker compose logs backend
docker compose logs frontend
```

### Development Commands

```bash
# Format Python code
make fmt

# Lint Python code
make lint

# Run tests
make test

# Install frontend dependencies
cd frontend && npm install

# Build frontend for production
cd frontend && npm run build
```

## Troubleshooting

### Docker Issues

#### Port Already in Use

If you get port conflicts, update the `.env` file:

```bash
# Change to different ports
API_PORT=8001
WEB_PORT=5174
```

#### Permission Denied

On Linux/macOS, you might need to run Docker with sudo or add your user to the docker group:

```bash
sudo usermod -aG docker $USER
# Log out and back in
```

#### Container Won't Start

Check the logs for specific errors:

```bash
docker compose logs backend
docker compose logs frontend
```

### LM Studio Connection Issues

#### "Failed to fetch models" Error

1. **Check LM Studio URL**: Ensure the URL in settings is correct
2. **Verify LM Studio is running**: Make sure LM Studio is active
3. **Check API compatibility**: Ensure LM Studio is using OpenAI-compatible API
4. **Network connectivity**: Test the URL directly in a browser

#### Models Not Loading

1. **Load models in LM Studio**: Make sure models are loaded before refreshing
2. **Check model format**: Ensure models are compatible with LM Studio
3. **Restart LM Studio**: Sometimes a restart helps

### Frontend Issues

#### Build Failures

```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### API Connection Issues

1. **Check backend status**: Visit http://localhost:8000/api/healthz
2. **Verify CORS**: Check browser console for CORS errors
3. **Network connectivity**: Ensure frontend can reach backend

### Backend Issues

#### "Failed to save settings" or "Failed to refresh models" Errors

These errors occur when the backend server is not running or not accessible:

1. **Check if backend is running**:
   ```bash
   # Test the health endpoint
   curl http://localhost:8000/api/healthz
   ```

2. **Start the backend server**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

3. **Verify dependencies are installed**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

#### "ModuleNotFoundError: No module named 'app'" Error

This error occurs when running uvicorn from the wrong directory:

1. **Make sure you're in the backend directory**:
   ```bash
   cd backend  # Must be in this directory
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

2. **Do NOT run from project root**:
   ```bash
   # WRONG - This will fail
   cd /path/to/OpenLLMWeb
   uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

#### Database Errors

The SQLite database is stored in a Docker volume. If you encounter database issues:

```bash
# Remove the volume and restart
docker compose down -v
docker compose up -d --build
```

#### Import Errors

Make sure all dependencies are installed:

```bash
cd backend
pip install -r requirements.txt
```

## Performance Optimization

### For Large Models

1. **Increase timeout**: The backend has a 120-second timeout for chat requests
2. **Adjust max tokens**: Reduce max_tokens in the chat form for faster responses
3. **Use streaming**: Consider implementing streaming responses for long outputs

### For Multiple Users

1. **Load balancing**: Use a reverse proxy like nginx for multiple backend instances
2. **Database optimization**: Consider PostgreSQL for high-concurrency scenarios
3. **Caching**: Implement model response caching for repeated queries

## Security Considerations

### LAN-Only Deployment

This application is designed for LAN-only use:

- No authentication is implemented
- CORS is open to all origins
- No HTTPS/TLS encryption
- Database is not encrypted

### For Production Use

Consider adding:

- Authentication and authorization
- HTTPS/TLS encryption
- Rate limiting
- Input validation and sanitization
- Database encryption
- Network security (firewall rules)

## Backup and Recovery

### Database Backup

```bash
# Backup the SQLite database
docker cp lmstudio_backend:/app/data/app.db ./backup.db
```

### Restore Database

```bash
# Stop the application
docker compose down

# Copy backup to volume
docker cp ./backup.db lmstudio_backend:/app/data/app.db

# Start the application
docker compose up -d
```

## Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
make rebuild
```

### Cleaning Up

```bash
# Remove unused Docker resources
docker system prune

# Remove application containers and volumes
docker compose down -v
```

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Review the application logs: `make logs`
3. Test individual components (LM Studio, backend API, frontend)
4. Create a new issue with detailed information about your setup and the problem


