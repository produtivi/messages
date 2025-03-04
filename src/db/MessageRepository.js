/**
 * Repository for message data persistence
 */
import logger from '../utils/logger.js';

export default class MessageRepository {
  /**
   * Create a new message repository
   * 
   * @param {Object} options - Configuration options
   * @param {Object} options.db - Database connection pool
   */
  constructor({ db }) {
    this.db = db;
    logger.info('Message repository initialized');
  }

  /**
   * Find a message by ID
   * 
   * @param {string} messageId - ID of the message
   * @returns {Promise<Object|null>} - Message object or null if not found
   */
  async findById(messageId) {
    try {
      const [rows] = await this.db.execute(
        'SELECT * FROM messages WHERE message_id = ? LIMIT 1',
        [messageId]
      );
      
      if (rows.length === 0) {
        logger.info(`No message found with ID ${messageId}`);
        return null;
      }
      
      logger.info(`Found message with ID ${messageId}`);
      return rows[0];
    } catch (error) {
      logger.error(`Error finding message by ID: ${error.message}`, { error });
      throw new Error(`Failed to find message: ${error.message}`);
    }
  }

  /**
   * Update message with context information
   * 
   * @param {Object} options - Options for the update
   * @param {string} options.messageId - ID of the message
   * @param {number} options.contextId - ID of the context/thread
   * @param {string} options.contextFrom - Source of the context (user or agent)
   * @returns {Promise<boolean>} - True if update was successful
   */
  async updateWithContext({ messageId, contextId, contextFrom }) {
    try {
      await this.db.execute(
        'UPDATE messages SET context_id = ?, context_from = ? WHERE message_id = ?',
        [contextId, contextFrom, messageId]
      );
      
      logger.info(`Updated message ${messageId} with context ${contextId} from ${contextFrom}`);
      
      return true;
    } catch (error) {
      logger.error(`Error updating message with context: ${error.message}`, { error });
      throw new Error(`Failed to update message with context: ${error.message}`);
    }
  }

  /**
   * Get messages for a thread
   * 
   * @param {Object} options - Options for retrieving messages
   * @param {number} options.threadId - ID of the thread
   * @param {number} [options.limit=50] - Maximum number of messages to retrieve
   * @returns {Promise<Array>} - List of messages
   */
  async getByThreadId({ threadId, limit = 50 }) {
    try {
      const [rows] = await this.db.execute(
        'SELECT * FROM messages WHERE context_id = ? ORDER BY timestamp DESC LIMIT ?',
        [threadId, limit]
      );
      
      logger.info(`Retrieved ${rows.length} messages for thread ${threadId}`);
      
      return rows;
    } catch (error) {
      logger.error(`Error retrieving messages for thread: ${error.message}`, { error });
      throw new Error(`Failed to retrieve messages for thread: ${error.message}`);
    }
  }

  /**
   * Save a new message
   * 
   * @param {Object} messageData - Data for the new message
   * @returns {Promise<Object>} - Created message
   */
  async create(messageData) {
    try {
      const {
        from_number,
        display_phone_number,
        wa_id,
        message_id,
        context_id,
        context_from,
        timestamp,
        type,
        text_body
      } = messageData;
      
      const [result] = await this.db.execute(
        `INSERT INTO messages (
          from_number, display_phone_number, wa_id, message_id, 
          context_id, context_from, timestamp, type, text_body
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          from_number,
          display_phone_number,
          wa_id,
          message_id,
          context_id,
          context_from,
          timestamp || new Date(),
          type,
          text_body
        ]
      );
      
      logger.info(`Created new message with ID ${message_id}`);
      
      return {
        id: result.insertId,
        message_id,
        ...messageData
      };
    } catch (error) {
      logger.error(`Error creating message: ${error.message}`, { error });
      throw new Error(`Failed to create message: ${error.message}`);
    }
  }
}