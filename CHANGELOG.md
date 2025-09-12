# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Chat History System**: Complete persistent chat management with SQLite storage
  - Left-side chat history panel with auto-generated chat names
  - Click to load previous conversations
  - Delete individual chats with confirmation
  - Persistent storage across app restarts
- **Context-Aware Conversations**: Configurable message context for continuing chats
  - Settings option to configure number of previous messages (0-20)
  - Default context of 5 previous messages
  - System messages always included first in conversation flow
- **Enhanced Chat Interface**: Modern conversation view with message bubbles
  - User and assistant message differentiation
  - Timestamps for all messages
  - Auto-scroll to latest messages
  - Real-time message updates
- **Improved Persona Integration**: System messages now properly prioritized
  - Persona system messages always sent first in conversation
  - Context messages included after system message
  - Proper message ordering for optimal LLM performance
- **New API Endpoints**:
  - `GET /api/chats` - List all chats
  - `GET /api/chats/{id}` - Get specific chat with messages
  - `DELETE /api/chats/{id}` - Delete chat and all messages
  - Enhanced `POST /api/chat` - Now supports chat_id for continuing conversations
- **Database Models**: New Chat and ChatMessage models for persistent storage
- **Settings Enhancement**: Added context message count configuration

### Fixed
- **Persona System Message Priority**: System messages now always included as first part of message payload
- **Copy to Clipboard**: Verified and confirmed working in both light and dark themes
- **Chat Persistence**: All conversations now properly saved and retrievable
- **Message Context**: Previous conversation context properly included in LLM requests
- **UI Layout**: New sidebar layout with proper responsive design

### Technical Details
- **Backend**: 
  - New `Chat` and `ChatMessage` SQLModel tables
  - `chat_service.py` for chat management operations
  - Enhanced settings service with context message count
  - Updated chat endpoint with context support
- **Frontend**:
  - New `ChatHistoryPanel` component for sidebar
  - New `Conversation` component for message display
  - Updated `Home` page with chat interface
  - Enhanced `Layout` component with sidebar support
  - Updated `QueryForm` with chat context support
  - Enhanced `SettingsModal` with context configuration
- **Database**: SQLite with new tables for chat persistence
- **API**: RESTful endpoints for complete chat management

### Previous Fixes
- **Critical Bug**: Missing FastAPI backend application causing "Failed to save settings" and "Failed to refresh models" errors
- **Backend Implementation**: Created complete FastAPI application with all required endpoints
- **Server Startup**: Fixed uvicorn server startup issues when running from wrong directory
- **Docker Configuration**: Fixed port mismatch between main.py (8000) and Dockerfile (8001)
- **Database Permissions**: Added proper directory creation and permissions for SQLite database in Docker
- **Pydantic Validation**: Fixed URL validation issues in settings schemas that prevented saving
- **Error Handling**: Added comprehensive error handling and logging for debugging save operations
- **Docker Health Checks**: Added health checks and restart policies for better container management

### Initial project structure and documentation

## [0.1.0] - 2024-01-XX

### Added
- Initial release of LMStudio Web UI
- Modern React frontend with TypeScript and Tailwind CSS
- FastAPI backend with SQLModel and SQLite
- Docker containerization with Docker Compose
- LM Studio integration with OpenAI-compatible API
- Persona management system with CRUD operations
- Model refresh functionality
- Light/dark theme support with persistence
- Copy-to-clipboard functionality for responses
- Settings modal for LM Studio URL configuration
- Responsive design for desktop and mobile
- Comprehensive documentation and setup guides
- Basic testing framework for backend
- Linting and formatting configuration
- Makefile for common development tasks

### Features
- **Frontend**:
  - React 18 with TypeScript
  - Vite for development and building
  - Tailwind CSS for styling
  - Lucide React icons
  - Axios for API communication
  - Theme persistence in localStorage
  - Responsive layout with cards and modern UI

- **Backend**:
  - FastAPI with Python 3.11
  - SQLModel for database operations
  - SQLite with persistent Docker volumes
  - httpx for LM Studio API communication
  - CORS configuration for LAN access
  - Comprehensive error handling

- **Infrastructure**:
  - Docker and Docker Compose setup
  - Nginx for frontend serving
  - Multi-stage Docker builds
  - Environment configuration
  - Network configuration for LAN access

- **API Endpoints**:
  - Health check endpoint
  - Settings management (GET/PUT)
  - Model listing and refresh
  - Persona CRUD operations
  - Chat completion endpoint

### Technical Details
- **Database**: SQLite with Persona and Setting models
- **API**: RESTful API with FastAPI
- **Frontend**: SPA with React Router (future)
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React icon library
- **HTTP Client**: Axios with error handling
- **State Management**: React hooks (useState, useEffect)
- **Theme**: CSS classes with localStorage persistence

### Documentation
- Comprehensive README with features and quick start
- Detailed SETUP.md with troubleshooting
- API documentation via FastAPI auto-generated docs
- Contributing guidelines
- MIT License
- Conventional Commits format

### Development
- ESLint and Prettier for frontend
- Black and Ruff for Python formatting and linting
- Pytest for backend testing
- Makefile for common tasks
- EditorConfig for consistent formatting
- Git ignore for common files

---

## Version History

- **0.1.0**: Initial release with core functionality
- **Unreleased**: Future features and improvements

## Future Roadmap

### Planned Features
- [ ] Streaming responses support
- [ ] Advanced chat parameters (temperature, max tokens sliders)
- [x] Chat history and conversation management ✅ **COMPLETED**
- [ ] Model comparison and benchmarking
- [ ] Export/import functionality for personas
- [ ] User authentication and multi-user support
- [ ] API rate limiting and usage tracking
- [ ] WebSocket support for real-time updates
- [ ] Mobile app (React Native)
- [ ] Plugin system for custom integrations

### Technical Improvements
- [ ] PostgreSQL support for production
- [ ] Redis caching for improved performance
- [ ] Comprehensive test coverage
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Performance monitoring and metrics
- [ ] Security audit and hardening
- [ ] Internationalization (i18n) support
- [ ] Progressive Web App (PWA) features


