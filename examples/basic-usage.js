/**
 * Basic usage example for @produtive/messages
 */
import mysql from 'mysql2/promise';
import { 
  ThreadContextService, 
  OpenAIAdapter, 
  ThreadRepository, 
  MessageRepository 
} from '@produtive/messages';

// Create MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'myapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create OpenAI adapter
const openaiAdapter = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY
});

// Create repositories
const threadRepository = new ThreadRepository({ db });
const messageRepository = new MessageRepository({ db });

// Create the main service
const threadContextService = new ThreadContextService({
  openaiAdapter,
  threadRepository,
  messageRepository
});

// Example function to update context after sending a template
async function updateContextAfterSendingTemplate() {
  try {
    const contactId = 123;
    const agentId = 456;
    const templateName = 'welcome_message';
    const templateParams = ['John Doe', '78901'];
    const messageId = 'wamid.123456789012345';
    
    const result = await threadContextService.updateContextAfterTemplate({
      contactId,
      agentId,
      templateName,
      templateParams,
      messageId
    });
    
    console.log('Context updated successfully!', result);
    
    return result;
  } catch (error) {
    console.error('Error updating context:', error.message);
    throw error;
  }
}

// Run the example
updateContextAfterSendingTemplate()
  .then(() => {
    console.log('Example completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Example failed:', error);
    process.exit(1);
  });