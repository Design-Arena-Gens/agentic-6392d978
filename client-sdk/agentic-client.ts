/**
 * Client SDK for Agentic CLI API
 * Use this in your VS Code extension to connect to the Agentic API
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  type: 'text' | 'tool_use' | 'tool_result' | 'error' | 'done';
  content?: string;
  toolName?: string;
  toolInput?: any;
  toolResult?: any;
}

export class AgenticClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://agentic-6392d978.vercel.app') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Create a new session with your Anthropic API key
   */
  async createSession(apiKey: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create session');
    }

    const data = await response.json();
    return data.sessionId;
  }

  /**
   * Send a message and get the complete response
   */
  async sendMessage(
    sessionId: string,
    message: string,
    systemPrompt?: string
  ): Promise<{ response: string; conversationHistory: Message[] }> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, message, systemPrompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return await response.json();
  }

  /**
   * Stream a message response (Server-Sent Events)
   */
  async streamMessage(
    sessionId: string,
    message: string,
    onChunk: (chunk: StreamChunk) => void,
    systemPrompt?: string
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, message, systemPrompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to stream message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const chunk = JSON.parse(data);
              onChunk(chunk);
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get conversation history for a session
   */
  async getHistory(sessionId: string): Promise<Message[]> {
    const response = await fetch(
      `${this.baseUrl}/api/history?sessionId=${sessionId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get history');
    }

    const data = await response.json();
    return data.conversationHistory;
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/session?sessionId=${sessionId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete session');
    }
  }
}
