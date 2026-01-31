import { NextRequest } from 'next/server';
import { sessionManager } from '@/lib/session-manager';
import { ClaudeClient } from '@/lib/claude-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, systemPrompt } = body;

    if (!sessionId || !message) {
      return new Response(
        JSON.stringify({ error: 'Session ID and message are required' }),
        { status: 400 }
      );
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401 }
      );
    }

    // Add user message to history
    session.conversationHistory.push({
      role: 'user',
      content: message,
    });

    const client = new ClaudeClient(session.apiKey);

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          for await (const chunk of client.streamMessage(
            session.conversationHistory,
            systemPrompt
          )) {
            const data = JSON.stringify(chunk);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));

            if (chunk.type === 'text' && chunk.content) {
              fullResponse += chunk.content;
            }

            if (chunk.type === 'done') {
              // Add assistant response to history
              session.conversationHistory.push({
                role: 'assistant',
                content: fullResponse,
              });
              sessionManager.updateConversation(sessionId, {
                role: 'assistant',
                content: fullResponse,
              });
            }
          }

          controller.close();
        } catch (error: any) {
          const errorData = JSON.stringify({
            type: 'error',
            content: error.message || 'Stream error',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process message' }),
      { status: 500 }
    );
  }
}
