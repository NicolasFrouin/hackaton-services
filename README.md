# Project Launch Platform

A full-stack application that allows users to submit project ideas and receive AI-powered analysis with Gantt chart planning using LangChain agents.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + LangChain agents
- **AI Integration**: OpenAI/LMStudio with specialized project management agent

## Features

- 🌐 **Multilingual Support** (English/French)
- 📋 **Project Form** with duration, resources, and description fields
- 🤖 **AI Analysis** using specialized Manager agent
- 📊 **Gantt Chart Planning** with task breakdown
- ⚠️ **Risk Assessment** and mitigation strategies
- 🔄 **Plan B Alternatives** for project contingencies
- 💾 **Results Storage** with localStorage persistence

## Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key OR LMStudio running locally
- Backend server running on port 3001

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd back
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the backend directory:
```env
# For OpenAI
OPENAI_API_KEY=your_openai_api_key_here
AGENT_MANAGER_MODEL=gpt-4o-mini

# OR for LMStudio (local)
AGENT_MANAGER_URL=http://localhost:1234/v1
AGENT_MANAGER_MODEL=your_local_model_name
REQUIRE_AUTH=false
PORT=3001
```

Start the backend server:
```bash
npm run dev
# or
npm start
```

The server will be available at `http://localhost:3001`

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd front
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Open the application** in your browser at `http://localhost:5173`

2. **Fill out the project form**:
   - Select project duration (or enter custom duration)
   - Add available resources (optional)
   - Provide detailed project description (required)

3. **Submit the project** by clicking "Launch your Project"

4. **View the analysis** which includes:
   - Technical specifications
   - Risk evaluation
   - Plan B alternatives
   - Gantt chart timeline

5. **Navigate back** to create new projects or view previous results

## API Endpoints

### Backend Server (`http://localhost:3001`)

- `GET /health` - Health check and server status
- `GET /agents` - List available agents
- `POST /manager/invoke` - Invoke manager agent for project analysis
- `POST /manager/stream` - Stream manager agent responses (SSE)
- `GET /conversations` - List all conversations
- `GET /conversations/:threadId` - Get specific conversation

### Authentication

The current setup uses a dummy token for development. In production, implement proper authentication:

```typescript
// In your requests
headers: {
  'Authorization': 'Bearer your_real_token_here'
}
```

## Configuration

### Frontend Configuration

Update `front/src/config/api.ts` to modify API settings:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001', // Change for production
  ENDPOINTS: {
    MANAGER_INVOKE: '/manager/invoke',
    // ... other endpoints
  }
};
```

### Backend Configuration

The backend uses environment variables for configuration. See `.env.example` for all available options.

## Development

### Adding New Agents

1. Create agent in `back/Agents/your-agent/`
2. Register in `back/serveur/agents-registry.mts`
3. Update frontend to use new agent endpoints

### Customizing the UI

- Components are in `front/src/components/`
- Styles use Tailwind CSS
- Translations are in the main App component

### Error Handling

The application includes comprehensive error handling for:
- Network connectivity issues
- Server errors
- Invalid responses
- Missing data

## Troubleshooting

### Common Issues

1. **"Unable to connect to server"**
   - Ensure backend is running on port 3001
   - Check CORS configuration
   - Verify API endpoint URLs

2. **"Agent not found"**
   - Check agent registration in agents-registry.mts
   - Verify agent model configuration
   - Ensure LMStudio is running (if using local models)

3. **Empty analysis results**
   - Check agent prompt configuration
   - Verify model response format
   - Review server logs for errors

### Logs

- Frontend: Browser console
- Backend: Terminal running the server
- Agent responses: Server logs with 🤖 prefix

## Production Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend
```bash
npm run build
# Deploy built files with proper environment variables
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_production_key
REQUIRE_AUTH=true
CORS_ORIGIN=https://your-frontend-domain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
