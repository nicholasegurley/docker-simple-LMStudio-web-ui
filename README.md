# LMStudio Web UI

A modern, open-source web interface for interacting with Local LLMs via LM Studio over your local network. Built with React, TypeScript, FastAPI, and Docker.

## Features

- 🚀 **Modern Web UI** - Clean, responsive interface with light/dark theme support
- 🤖 **LM Studio Integration** - Seamless connection to your local LM Studio server
- 👤 **Persona Management** - Create and manage custom AI personas with system prompts
- 🔄 **Model Refresh** - Dynamically fetch available models from LM Studio
- 📋 **Copy to Clipboard** - Easy response copying with visual feedback
- 🐳 **Docker Ready** - One-command deployment with Docker Compose
- 🌐 **LAN Access** - Accessible across your local network
- ⚡ **Fast & Lightweight** - Built with modern web technologies

## Screenshots

*Coming soon - placeholder for UI screenshots*

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

### Backend
- **FastAPI** with Python 3.11
- **SQLModel** (SQLAlchemy + Pydantic) for database operations
- **SQLite** for data persistence
- **httpx** for LM Studio API communication
- **Uvicorn** ASGI server

### Infrastructure
- **Docker** & **Docker Compose** for containerization
- **Nginx** for frontend serving
- **SQLite** with persistent volumes

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- LM Studio running on your machine or network

### 1. Clone and Setup

```bash
git clone <repository-url>
cd lmstudio-web-ui
cd infrastructure
cp env.example .env
```

### 2. Start the Application

```bash
# From the project root
make up

# Or manually:
cd infrastructure
docker compose up -d --build
```

### 3. Access the Application

Open your browser and navigate to:
- **Web UI**: http://localhost:5173
- **API Docs**: http://localhost:8001/docs

## Configuration

### LM Studio Setup

1. Open the web UI and click the settings (⚙️) icon
2. Set your LM Studio Base URL (e.g., `http://192.168.1.10:1234/v1`)
3. Click "Refresh Models" to load available models
4. Save your settings

### Default LM Studio URL

The application defaults to `http://127.0.0.1:1234/v1` if no custom URL is set.

## Usage

### Basic Chat

1. Select a model from the dropdown
2. Optionally choose a persona
3. Type your message and click "Send"
4. Copy responses using the clipboard icon

### Persona Management

1. Open Settings (⚙️ icon)
2. Scroll to "Persona Manager"
3. Click "Add Persona" to create custom AI personalities
4. Edit or delete existing personas as needed

### Theme Toggle

Click the sun/moon icon in the top-right to switch between light and dark themes. Your preference is saved automatically.

## LAN Access

The application is configured to be accessible across your local network:

- **Frontend**: Available on all network interfaces (0.0.0.0:5173)
- **Backend**: Available on all network interfaces (0.0.0.0:8001)
- **CORS**: Configured to allow requests from any origin

## Development

### Local Development (without Docker)

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Important**: The backend server must be run from the `backend` directory, not the project root.

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Available Commands

```bash
make up          # Start the application
make down        # Stop the application
make logs        # View logs
make rebuild     # Rebuild and restart
make fmt         # Format Python code
make lint        # Lint Python code
make test        # Run tests
```

## API Endpoints

- `GET /api/healthz` - Health check
- `GET /api/settings` - Get current settings
- `PUT /api/settings` - Update settings
- `GET /api/models` - List available models
- `POST /api/models/refresh` - Refresh model list
- `GET /api/personas` - List personas
- `POST /api/personas` - Create persona
- `PUT /api/personas/{id}` - Update persona
- `DELETE /api/personas/{id}` - Delete persona
- `POST /api/chat` - Send chat message

## Troubleshooting

### Backend Issues

1. **"Failed to save settings" or "Failed to refresh models" errors**: 
   - Ensure the backend server is running: `cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8001`
   - Check that you're running the server from the `backend` directory, not the project root
   - Verify all dependencies are installed: `pip install -r requirements.txt`

2. **"ModuleNotFoundError: No module named 'app'"**:
   - Make sure you're running uvicorn from the `backend` directory
   - Install missing dependencies: `pip install fastapi uvicorn sqlmodel httpx pydantic`

### LM Studio Connection Issues

1. **Check LM Studio URL**: Ensure the URL in settings is correct
2. **Verify LM Studio is running**: Make sure LM Studio is active and serving on the specified port
3. **Network connectivity**: For LAN access, ensure both devices are on the same network
4. **Firewall**: Check that ports 1234 (LM Studio) and 8001/5173 (Web UI) are not blocked

### Model Loading Issues

1. **Refresh Models**: Use the "Refresh Models" button in settings
2. **Check LM Studio**: Ensure models are loaded in LM Studio
3. **API Compatibility**: Verify LM Studio is using OpenAI-compatible API format

### Docker Issues

1. **Port conflicts**: Change ports in `.env` if 8000 or 5173 are in use
2. **Permission issues**: Ensure Docker has proper permissions
3. **Volume issues**: Check that the database volume is properly mounted

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- **Python**: Black + Ruff (configured in `pyproject.toml`)
- **TypeScript**: ESLint + Prettier
- **Commits**: Conventional Commits format

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## Support

- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Documentation**: Check the [SETUP.md](SETUP.md) for detailed setup instructions

---

**Note**: This application is designed for LAN-only use and does not include authentication or external network access by default. For production use, consider adding appropriate security measures.


