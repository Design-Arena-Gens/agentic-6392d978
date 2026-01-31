export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Agentic CLI API</h1>
      <p>REST API wrapper for the agentic CLI to use with VS Code extensions.</p>

      <h2>API Endpoints</h2>

      <h3>1. Create Session</h3>
      <pre>
POST /api/session
Body: {'{'}
  "apiKey": "your-anthropic-api-key"
{'}'}

Response: {'{'}
  "sessionId": "uuid",
  "message": "Session created successfully"
{'}'}
      </pre>

      <h3>2. Send Message (Non-streaming)</h3>
      <pre>
POST /api/chat
Body: {'{'}
  "sessionId": "uuid",
  "message": "your message",
  "systemPrompt": "optional system prompt"
{'}'}

Response: {'{'}
  "response": "assistant response",
  "conversationHistory": [...]
{'}'}
      </pre>

      <h3>3. Stream Message (SSE)</h3>
      <pre>
POST /api/stream
Body: {'{'}
  "sessionId": "uuid",
  "message": "your message",
  "systemPrompt": "optional system prompt"
{'}'}

Response: Server-Sent Events stream
data: {'{\"type\":\"text\",\"content\":\"Hello\"}'}{'\n'}{'\n'}
data: {'{\"type\":\"done\"}'}{'\n'}{'\n'}
      </pre>

      <h3>4. Get Conversation History</h3>
      <pre>
GET /api/history?sessionId=uuid

Response: {'{'}
  "conversationHistory": [
    {'{'} "role": "user", "content": "..." {'}'},
    {'{'} "role": "assistant", "content": "..." {'}'}
  ]
{'}'}
      </pre>

      <h3>5. Delete Session</h3>
      <pre>
DELETE /api/session?sessionId=uuid

Response: {'{'}
  "message": "Session deleted successfully"
{'}'}
      </pre>

      <h2>VS Code Extension Usage</h2>
      <p>Import the client SDK in your VS Code extension:</p>
      <pre>
{`import { AgenticClient } from './agentic-client';

const client = new AgenticClient('https://agentic-6392d978.vercel.app');
const sessionId = await client.createSession(apiKey);
const response = await client.sendMessage(sessionId, 'Hello!');

// For streaming:
await client.streamMessage(sessionId, 'Hello!', (chunk) => {
  console.log(chunk);
});`}
      </pre>
    </div>
  );
}
