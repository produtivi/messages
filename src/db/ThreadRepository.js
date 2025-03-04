/**
 * Repository for thread data persistence
 */
import logger from '../utils/logger.js';

export default class ThreadRepository {
  /**
   * Create a new thread repository
   * 
   * @param {Object} options - Configuration options
   * @param {Object} options.db - Database connection pool
   */
  constructor({ db }) {
    this.db = db;
    logger.info('Thread repository initialized');
  }

  /**
   * Find a thread by contact and agent IDs
   * 
   * @param {number} contactId - ID of the contact
   * @param {number} agentId - ID of the agent
   * @returns {Promise<Object|null>} - Thread object or null if not found
   */
  async findByContactAndAgent(contactId, agentId) {
    try {
      const [rows] = await this.db.execute(
        'SELECT * FROM threads WHERE contact_id = ? AND agent_id = ? AND deleted_at IS NULL LIMIT 1',
        [contactId, agentId]
      );
      
      if (rows.length === 0) {
        logger.info(`No existing thread found for contact ${contactId} and agent ${agentId}`);
        return null;
      }
      
      logger.info(`Found thread ${rows[0].id} for contact ${contactId} and agent ${agentId}`);
      return rows[0];
    } catch (error) {
      logger.error(`Error finding thread by contact and agent: ${error.message}`, { error });
      throw new Error(`Failed to find thread: ${error.message}`);
    }
  }

  /**
   * Create a new thread
   * 
   * @param {Object} threadData - Data for the new thread
   * @param {number} threadData.contactId - ID of the contact
   * @param {number} threadData.agentId - ID of the agent
   * @param {string} threadData.openaiId - OpenAI thread ID
   * @returns {Promise<Object>} - Created thread object
   */
  async create({ contactId, agentId, openaiId }) {
    try {
      const now = new Date();
      
      const [result] = await this.db.execute(
        'INSERT INTO threads (contact_id, agent_id, openai_id, created_at, last_interaction_at) VALUES (?, ?, ?, ?, ?)',
        [contactId, agentId, openaiId, now, now]
      );
      
      logger.info(`Created new thread with ID ${result.insertId}`);
      
      return {
        id: result.insertId,
        contact_id: contactId,
        agent_id: agentId,
        openai_id: openaiId,
        created_at: now,
        last_interaction_at: now,
        last_message_from: null
      };
    } catch (error) {
      logger.error(`Error creating thread: ${error.message}`, { error });
      throw new Error(`Failed to create thread: ${error.message}`);
    }
  }

  /**
   * Update thread's last interaction
   * 
   * @param {Object} options - Options for the update
   * @param {number} options.threadId - ID of the thread
   * @param {string} options.lastMessageFrom - Source of the last message (user or agent)
   * @returns {Promise<boolean>} - True if update was successful
   */
  async updateLastInteraction({ threadId, lastMessageFrom }) {
    try {
      const now = new Date();
      
      await this.db.execute(
        'UPDATE threads SET last_interaction_at = ?, last_message_from = ? WHERE id = ?',
        [now, lastMessageFrom, threadId]
      );
      
      logger.info(`Updated last interaction for thread ${threadId}`);
      
      return true;
    } catch (error) {
      logger.error(`Error updating thread last interaction: ${error.message}`, { error });
      throw new Error(`Failed to update thread last interaction: ${error.message}`);
    }
  }

  /**
   * Find a thread by ID
   * 
   * @param {number} threadId - ID of the thread
   * @returns {Promise<Object|null>} - Thread object or null if not found
   */
  async findById(threadId) {
    try {
      const [rows] = await this.db.execute(
        'SELECT * FROM threads WHERE id = ? AND deleted_at IS NULL LIMIT 1',
        [threadId]
      );
      
      if (rows.length === 0) {
        logger.info(`No thread found with ID ${threadId}`);
        return null;
      }
      
      logger.info(`Found thread ${rows[0].id}`);
      return rows[0];
    } catch (error) {
      logger.error(`Error finding thread by ID: ${error.message}`, { error });
      throw new Error(`Failed to find thread by ID: ${error.message}`);
    }
  }
}