import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session-manager';
import { ClaudeClient } from '@/lib/claude-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, systemPrompt } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'Session ID and message are required' },
        { status: 400 }
      );
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Add user message to history
    session.conversationHistory.push({
      role: 'user',
      content: message,
    });

    const client = new ClaudeClient(session.apiKey);
    const response = await client.sendMessage(
      session.conversationHistory,
      systemPrompt
    );

    // Add assistant response to history
    session.conversationHistory.push({
      role: 'assistant',
      content: response,
    });

    sessionManager.updateConversation(sessionId, {
      role: 'assistant',
      content: response,
    });

    return NextResponse.json({
      response,
      conversationHistory: session.conversationHistory,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
