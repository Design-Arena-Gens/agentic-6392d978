/**
 * Example usage of the Agentic Client SDK in a VS Code extension
 */

import { AgenticClient } from './agentic-client';

async function exampleUsage() {
  // Initialize the client
  const client = new AgenticClient('https://agentic-6392d978.vercel.app');

  // Create a session with your API key
  const apiKey = 'your-anthropic-api-key';
  const sessionId = await client.createSession(apiKey);
  console.log('Session created:', sessionId);

  // Example 1: Send a message and get the complete response
  const result = await client.sendMessage(
    sessionId,
    'Write a hello world function in TypeScript'
  );
  console.log('Response:', result.response);

  // Example 2: Stream a message response
  await client.streamMessage(
    sessionId,
    'Explain what this function does',
    (chunk) => {
      if (chunk.type === 'text') {
        process.stdout.write(chunk.content || '');
      } else if (chunk.type === 'done') {
        console.log('\nStream complete');
      } else if (chunk.type === 'error') {
        console.error('Error:', chunk.content);
      }
    }
  );

  // Example 3: Get conversation history
  const history = await client.getHistory(sessionId);
  console.log('Conversation history:', history);

  // Example 4: Clean up - delete the session when done
  await client.deleteSession(sessionId);
  console.log('Session deleted');
}

// VS Code extension integration example
export function activate(context: any) {
  const client = new AgenticClient('https://agentic-6392d978.vercel.app');
  let sessionId: string | null = null;

  // Command to start a session
  context.subscriptions.push(
    commands.registerCommand('agentic.startSession', async () => {
      const apiKey = await context.globalState.get('anthropic-api-key');
      if (!apiKey) {
        const input = await vscode.window.showInputBox({
          prompt: 'Enter your Anthropic API key',
          password: true,
        });
        if (input) {
          await context.globalState.update('anthropic-api-key', input);
          sessionId = await client.createSession(input);
        }
      } else {
        sessionId = await client.createSession(apiKey);
      }
      vscode.window.showInformationMessage('Agentic session started!');
    })
  );

  // Command to send a message
  context.subscriptions.push(
    commands.registerCommand('agentic.sendMessage', async () => {
      if (!sessionId) {
        vscode.window.showErrorMessage('No active session. Start a session first.');
        return;
      }

      const message = await vscode.window.showInputBox({
        prompt: 'Enter your message',
      });

      if (message) {
        const result = await client.sendMessage(sessionId, message);

        // Display response in a new document
        const doc = await vscode.workspace.openTextDocument({
          content: result.response,
          language: 'markdown',
        });
        await vscode.window.showTextDocument(doc);
      }
    })
  );

  // Clean up on deactivation
  context.subscriptions.push({
    dispose: async () => {
      if (sessionId) {
        await client.deleteSession(sessionId);
      }
    },
  });
}
