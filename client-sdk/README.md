# Agentic Client SDK

TypeScript/JavaScript client library for connecting to the Agentic CLI API from VS Code extensions.

## Installation

Copy `agentic-client.ts` to your VS Code extension project.

## Quick Start

```typescript
import { AgenticClient } from './agentic-client';

// Initialize client
const client = new AgenticClient('https://agentic-6392d978.vercel.app');

// Create session
const sessionId = await client.createSession('your-anthropic-api-key');

// Send message
const result = await client.sendMessage(sessionId, 'Hello!');
console.log(result.response);

// Stream response
await client.streamMessage(sessionId, 'Write code', (chunk) => {
  if (chunk.type === 'text') {
    console.log(chunk.content);
  }
});

// Clean up
await client.deleteSession(sessionId);
```

## API Methods

### `createSession(apiKey: string): Promise<string>`
Creates a new session and returns a session ID.

### `sendMessage(sessionId: string, message: string, systemPrompt?: string): Promise<{response: string, conversationHistory: Message[]}>`
Sends a message and returns the complete response.

### `streamMessage(sessionId: string, message: string, onChunk: (chunk: StreamChunk) => void, systemPrompt?: string): Promise<void>`
Streams message response in real-time via Server-Sent Events.

### `getHistory(sessionId: string): Promise<Message[]>`
Retrieves conversation history for a session.

### `deleteSession(sessionId: string): Promise<void>`
Deletes a session and cleans up resources.

## Types

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamChunk {
  type: 'text' | 'tool_use' | 'tool_result' | 'error' | 'done';
  content?: string;
  toolName?: string;
  toolInput?: any;
  toolResult?: any;
}
```

## VS Code Extension Integration

See `example-usage.ts` for a complete VS Code extension example with commands for:
- Starting a session
- Sending messages
- Displaying responses
- Cleaning up on deactivation
