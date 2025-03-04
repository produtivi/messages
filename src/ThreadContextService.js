/**
 * Service for managing thread context after sending template messages
 */
import logger from './utils/logger.js';
import { parseTemplate } from './utils/templateParser.js';

export default class ThreadContextService {
  /**
   * Create a new ThreadContextService
   * 
   * @param {Object} options - Configuration options
   * @param {Object} options.openaiAdapter - Adapter for OpenAI API
   * @param {Object} options.threadRepository - Repository for thread data
   * @param {Object} options.messageRepository - Repository for message data
   */
  constructor({ openaiAdapter, threadRepository, messageRepository }) {
    this.openaiAdapter = openaiAdapter;
    this.threadRepository = threadRepository;
    this.messageRepository = messageRepository;
  }

  /**
   * Update thread context after sending a template message
   * 
   * @param {Object} options - Options for updating context
   * @param {number} options.contactId - ID of the contact
   * @param {number} options.agentId - ID of the agent
   * @param {string} options.templateName - Name of the template
   * @param {Object} options.templateParams - Parameters for the template
   * @param {string} options.messageId - ID of the sent message
   * @returns {Promise<Object>} - Result of the operation
   */
  async updateContextAfterTemplate({ contactId, agentId, templateName, templateParams, messageId }) {
    try {
      logger.info(`Updating context for contact ${contactId} with agent ${agentId} after template ${templateName}`);
      
      // Find or create thread
      const thread = await this._getOrCreateThread(contactId, agentId);
      
      // Get the full message content from template
      const messageContent = await this._getTemplateContent(templateName, templateParams);
      
      // Update OpenAI thread
      await this.openaiAdapter.addMessageToThread({
        threadId: thread.openai_id,
        content: messageContent,
        role: 'assistant'
      });
      
      // Update message in database with context information
      await this.messageRepository.updateWithContext({
        messageId,
        contextId: thread.id,
        contextFrom: 'agent'
      });
      
      // Update thread in database
      await this.threadRepository.updateLastInteraction({
        threadId: thread.id,
        lastMessageFrom: 'agent'
      });
      
      logger.info(`Successfully updated context for thread ${thread.id}`);
      
      return {
        success: true,
        threadId: thread.id,
        openaiThreadId: thread.openai_id
      };
    } catch (error) {
      logger.error(`Error updating context: ${error.message}`, { error });
      throw new Error(`Failed to update thread context: ${error.message}`);
    }
  }
  
  /**
   * Get or create a thread for a contact and agent
   * 
   * @private
   * @param {number} contactId - ID of the contact
   * @param {number} agentId - ID of the agent
   * @returns {Promise<Object>} - Thread object
   */
  async _getOrCreateThread(contactId, agentId) {
    try {
      // Try to find existing thread
      const existingThread = await this.threadRepository.findByContactAndAgent(contactId, agentId);
      
      if (existingThread) {
        logger.info(`Found existing thread ${existingThread.id} for contact ${contactId} and agent ${agentId}`);
        return existingThread;
      }
      
      // Create new OpenAI thread
      const openaiThread = await this.openaiAdapter.createThread();
      
      // Create new thread in database
      const newThread = await this.threadRepository.create({
        contactId,
        agentId,
        openaiId: openaiThread.id
      });
      
      logger.info(`Created new thread ${newThread.id} with OpenAI thread ID ${openaiThread.id}`);
      
      return newThread;
    } catch (error) {
      logger.error(`Error getting or creating thread: ${error.message}`, { error });
      throw new Error(`Failed to get or create thread: ${error.message}`);
    }
  }
  
  /**
   * Get the full message content from a template
   * 
   * @private
   * @param {string} templateName - Name of the template
   * @param {Object} templateParams - Parameters for the template
   * @returns {Promise<string>} - Parsed template content
   */
  async _getTemplateContent(templateName, templateParams) {
    try {
      const parsedContent = parseTemplate(templateName, templateParams);
      return parsedContent;
    } catch (error) {
      logger.error(`Error parsing template: ${error.message}`, { error });
      throw new Error(`Failed to parse template: ${error.message}`);
    }
  }
}