/**
 * Adapter for OpenAI API integration
 */
import OpenAI from 'openai';
import logger from '../utils/logger.js';

export default class OpenAIAdapter {
  /**
   * Create a new OpenAI adapter
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - OpenAI API key
   */
  constructor({ apiKey }) {
    this.client = new OpenAI({
      apiKey
    });
    
    logger.info('OpenAI adapter initialized');
  }

  /**
   * Create a new thread in OpenAI
   * 
   * @returns {Promise<Object>} - Created thread
   */
  async createThread() {
    try {
      logger.info('Creating new OpenAI thread');
      
      const thread = await this.client.beta.threads.create();
      
      logger.info(`Successfully created OpenAI thread ${thread.id}`);
      
      return thread;
    } catch (error) {
      logger.error(`Error creating OpenAI thread: ${error.message}`, { error });
      throw new Error(`Failed to create OpenAI thread: ${error.message}`);
    }
  }

  /**
   * Add a message to an existing thread
   * 
   * @param {Object} options - Options for adding a message
   * @param {string} options.threadId - ID of the thread
   * @param {string} options.content - Content of the message
   * @param {string} options.role - Role of the message sender (user or assistant)
   * @returns {Promise<Object>} - Created message
   */
  async addMessageToThread({ threadId, content, role }) {
    try {
      logger.info(`Adding ${role} message to OpenAI thread ${threadId}`);
      
      const message = await this.client.beta.threads.messages.create(
        threadId,
        {
          role,
          content
        }
      );
      
      logger.info(`Successfully added message ${message.id} to thread ${threadId}`);
      
      return message;
    } catch (error) {
      logger.error(`Error adding message to thread ${threadId}: ${error.message}`, { error });
      throw new Error(`Failed to add message to OpenAI thread: ${error.message}`);
    }
  }

  /**
   * Run an assistant on a thread
   * 
   * @param {Object} options - Options for running the assistant
   * @param {string} options.threadId - ID of the thread
   * @param {string} options.assistantId - ID of the assistant
   * @returns {Promise<Object>} - Run result
   */
  async runAssistantOnThread({ threadId, assistantId }) {
    try {
      logger.info(`Running assistant ${assistantId} on thread ${threadId}`);
      
      const run = await this.client.beta.threads.runs.create(
        threadId,
        {
          assistant_id: assistantId
        }
      );
      
      logger.info(`Successfully started run ${run.id} for assistant ${assistantId} on thread ${threadId}`);
      
      return run;
    } catch (error) {
      logger.error(`Error running assistant on thread: ${error.message}`, { error });
      throw new Error(`Failed to run assistant on thread: ${error.message}`);
    }
  }
  
  /**
   * Get messages from a thread
   * 
   * @param {Object} options - Options for retrieving messages
   * @param {string} options.threadId - ID of the thread
   * @param {Object} [options.params] - Optional parameters for the request
   * @returns {Promise<Array>} - List of messages
   */
  async getThreadMessages({ threadId, params = {} }) {
    try {
      logger.info(`Retrieving messages from thread ${threadId}`);
      
      const response = await this.client.beta.threads.messages.list(
        threadId,
        params
      );
      
      logger.info(`Successfully retrieved ${response.data.length} messages from thread ${threadId}`);
      
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving messages from thread ${threadId}: ${error.message}`, { error });
      throw new Error(`Failed to retrieve messages from thread: ${error.message}`);
    }
  }
}