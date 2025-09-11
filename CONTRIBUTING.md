# Contributing to LMStudio Web UI

Thank you for your interest in contributing to LMStudio Web UI! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- **Docker** and **Docker Compose** for containerized development
- **Node.js** (18+) and **npm** for frontend development
- **Python** (3.11+) for backend development
- **Git** for version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/lmstudio-web-ui.git
   cd lmstudio-web-ui
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/lmstudio-web-ui.git
   ```

## Development Setup

### Option 1: Docker Development (Recommended)

```bash
# Start the development environment
make up

# View logs
make logs

# Stop when done
make down
```

### Option 2: Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Making Changes

### Branch Strategy

1. Create a feature branch from `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add persona import/export functionality"
git commit -m "fix: resolve model loading timeout issue"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for persona service"
```

## Pull Request Process

### Before Submitting

1. **Test your changes**: Ensure all tests pass and the application works correctly
2. **Update documentation**: Update relevant documentation if needed
3. **Check code style**: Run linting and formatting tools
4. **Update CHANGELOG.md**: Add your changes to the changelog

### Creating a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template with:
   - Description of changes
   - Testing instructions
   - Screenshots (if applicable)
   - Related issues

### PR Review Process

1. **Automated checks**: CI/CD pipeline will run tests and linting
2. **Code review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Merge**: Once approved, your PR will be merged

## Code Style Guidelines

### Python (Backend)

We use **Black** for formatting and **Ruff** for linting:

```bash
# Format code
make fmt

# Lint code
make lint
```

**Guidelines:**
- Follow PEP 8 style guide
- Use type hints where possible
- Write docstrings for functions and classes
- Keep functions small and focused
- Use meaningful variable and function names

**Example:**
```python
from typing import List, Optional
from sqlmodel import Session

def get_personas(session: Session) -> List[Persona]:
    """Retrieve all personas from the database.
    
    Args:
        session: Database session
        
    Returns:
        List of Persona objects
    """
    return session.exec(select(Persona)).all()
```

### TypeScript/React (Frontend)

We use **ESLint** and **Prettier** for code quality:

```bash
cd frontend
npm run lint
```

**Guidelines:**
- Use TypeScript for all new code
- Prefer functional components with hooks
- Use meaningful component and variable names
- Keep components small and focused
- Use proper TypeScript types

**Example:**
```typescript
interface PersonaManagerProps {
  onPersonaChange: (persona: Persona | null) => void;
}

export default function PersonaManager({ onPersonaChange }: PersonaManagerProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  
  // Component logic...
}
```

### CSS/Styling

- Use **Tailwind CSS** utility classes
- Create custom components in `src/styles/index.css`
- Follow mobile-first responsive design
- Use semantic color names (e.g., `text-gray-900` not `text-black`)

## Testing

### Backend Testing

```bash
cd backend
pytest
```

**Guidelines:**
- Write unit tests for all new functions
- Test both success and error cases
- Use descriptive test names
- Mock external dependencies

**Example:**
```python
def test_create_persona():
    """Test persona creation with valid data."""
    session = get_test_session()
    persona = create_persona(session, "Test Persona", "You are helpful")
    
    assert persona.name == "Test Persona"
    assert persona.system_prompt == "You are helpful"
    assert persona.id is not None
```

### Frontend Testing

*Frontend testing setup coming soon*

## Documentation

### Code Documentation

- **Python**: Use docstrings for functions, classes, and modules
- **TypeScript**: Use JSDoc comments for complex functions
- **README**: Update README.md for new features
- **API**: FastAPI auto-generates API docs

### Documentation Updates

When adding new features:
1. Update README.md if it's a user-facing feature
2. Update SETUP.md if setup process changes
3. Update CHANGELOG.md with your changes
4. Add inline code comments for complex logic

## Reporting Issues

### Bug Reports

Use the GitHub issue template and include:

1. **Environment**:
   - OS and version
   - Docker version
   - LM Studio version

2. **Steps to reproduce**:
   - Clear, numbered steps
   - Expected vs actual behavior

3. **Additional context**:
   - Screenshots or error messages
   - Logs from `make logs`
   - Browser console errors (if applicable)

### Security Issues

For security vulnerabilities, please email the maintainers directly rather than creating a public issue.

## Feature Requests

When requesting features:

1. **Check existing issues**: Search for similar requests
2. **Describe the problem**: What problem does this solve?
3. **Propose a solution**: How should it work?
4. **Consider alternatives**: Are there other ways to solve this?

## Development Workflow

### Daily Development

1. **Start your day**:
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make changes and test**:
   ```bash
   # Make your changes
   make fmt  # Format code
   make lint # Check linting
   make test # Run tests
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature
   ```

### Release Process

1. **Update version numbers**
2. **Update CHANGELOG.md**
3. **Create release PR**
4. **Tag release**
5. **Deploy**

## Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bugs and feature requests
- **Code Review**: Ask questions in PR comments
- **Documentation**: Check existing docs first

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- GitHub contributor graph

Thank you for contributing to LMStudio Web UI! 🚀
