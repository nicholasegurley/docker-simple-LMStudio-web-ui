This is an unofficial project and is not affiliated with or endorsed by LM Studio.

# Dockerized Simple LMStudio Web UI (Unofficial)

A modern, open-source web interface for interacting with Local LLMs via LM Studio over your local network. Built with React, TypeScript, FastAPI, and Docker.  This is a personal project and not an unofficial LM Studio project.

Download [LM Studio](https://lmstudio.ai/)

## Features

- **Modern Web UI** - Clean, responsive interface with light/dark theme support
- **LM Studio Integration** - Seamless connection to your local LM Studio server
- **Persona Management** - Create and manage custom AI personas with system prompts
- **Chat History** - Persistent conversation management with auto-generated chat names
- **Context-Aware Conversations** - Configurable message context for continuing chats
- **Model Refresh** - Dynamically fetch available models from LM Studio
- **Copy to Clipboard** - Easy response copying with visual feedback
- **Docker Ready** - One-command deployment with Docker Compose
- **LAN Access** - Accessible across your local network
- **Fast & Lightweight** - Built with modern web technologies

## Screenshots

<img width="2863" height="1598" alt="Screenshot 2025-09-12 222656" src="https://github.com/user-attachments/assets/6816f4e1-5d54-44ab-b312-5c3e74da5851" />

<img width="2849" height="1597" alt="Screenshot 2025-09-12 222721" src="https://github.com/user-attachments/assets/a626545f-3466-475c-b94d-fbefbc2c1086" />

<img width="2861" height="1594" alt="Screenshot 2025-09-12 222743" src="https://github.com/user-attachments/assets/1dd3e453-9223-44ff-b172-3192c5788582" />

## Use Case

I built this application to make better use of my homelab setup. My older gaming laptop has a solid GPU and runs LM Studio quickly and reliably, but it doesn’t have the spare resources to also handle Docker and everything else I run on it. Instead of using solutions like Ollama or OpenWebUI, I chose to dedicate the laptop to running LM Studio alone.

Meanwhile, my homelab has plenty of capacity for a VM running Docker. This application bridges the two: it lets me run LM Studio on the GPU-equipped laptop while hosting a clean, Dockerized interface on my LAN.

If you have a similar setup, you can do the same—fast local inference on your GPU machine, with a lightweight and accessible interface served from your homelab.

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
cd docker-simple-LMStudio-web-ui
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

The application defaults to `http://192.168.4.70:1234/v1` if no custom URL is set.

## Usage

### Chat Interface

The interface now features a modern chat layout with:

- **Left Sidebar**: Chat history panel showing all your conversations
- **Main Area**: Current conversation with message bubbles
- **Input Area**: Message input at the bottom

### Starting a New Chat

1. Click the "+" button in the chat history panel
2. Select a model from the dropdown
3. Optionally choose a persona
4. Type your message and click "Send"
5. The chat will be automatically saved with an auto-generated name

### Continuing Existing Chats

1. Click on any chat in the left sidebar to load it
2. The conversation history will be displayed
3. Continue typing - previous context will be included automatically
4. Configure context length in Settings (default: 5 previous messages)

### Chat Management

- **Auto-Generated Names**: Chats are named based on your first message
- **Delete Chats**: Click the trash icon next to any chat to delete it
- **Persistent Storage**: All conversations are saved and survive app restarts

### Persona Management

1. Open Settings (⚙️ icon)
2. Scroll to "Persona Manager"
3. Click "Add Persona" to create custom AI personalities
4. Edit or delete existing personas as needed
5. **System Message Priority**: Persona system messages are always sent first

### Context Configuration

1. Open Settings (⚙️ icon)
2. Set "Number of Previous Messages to Send as Context" (0-20)
3. Default is 5 messages for optimal performance
4. Set to 0 to disable context (each message is independent)

### Copy Responses

Click the copy icon next to any response to copy it to your clipboard. Works in both light and dark themes.

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

### Core Endpoints
- `GET /api/healthz` - Health check
- `GET /api/settings` - Get current settings (includes context message count)
- `PUT /api/settings` - Update settings (LM Studio URL and context count)

### Model Management
- `GET /api/models` - List available models
- `POST /api/models/refresh` - Refresh model list

### Persona Management
- `GET /api/personas` - List personas
- `POST /api/personas` - Create persona
- `PUT /api/personas/{id}` - Update persona
- `DELETE /api/personas/{id}` - Delete persona

### Chat Management
- `GET /api/chats` - List all chats
- `GET /api/chats/{id}` - Get specific chat with messages
- `DELETE /api/chats/{id}` - Delete chat and all messages
- `POST /api/chat` - Send chat message (supports chat_id for continuing conversations)

## Troubleshooting

### Backend Issues

1. **"Failed to save settings" or "Failed to refresh models" errors**: 
   - Ensure the backend server is running: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001`
   - Check that you're running the server from the `backend` directory, not the project root
   - Verify all dependencies are installed: `pip install -r requirements.txt`
   - Check Docker logs: `docker compose logs backend` for detailed error messages

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

1. **Port conflicts**: Change ports in `.env` if 8001 or 5173 are in use
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
- **Documentation**: Check the [SETUP.md](SETUP.md) for detailed setup instructions

## Security Note 

This application is designed for LAN-only use and does not include authentication or external network access by default. For production use, consider adding appropriate security measures.

## Disclaimer

This project is provided "as is" and "as available", without warranty of any kind, express or implied.

Use of this software is at your own risk. The author(s) are not responsible for any damages, data loss, or issues that may arise from using, modifying, or distributing this code.

By using this repository, you agree that you assume all responsibility for any outcomes that result from its use.
