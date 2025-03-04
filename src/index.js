/**
 * @produtive/messages
 * Library for synchronizing WhatsApp Business API template messages with OpenAI Assistant API threads.
 */

// Main service
export { default as ThreadContextService } from './ThreadContextService.js';

// Adapters
export { default as OpenAIAdapter } from './adapters/openai.js';

// Repositories
export { default as ThreadRepository } from './db/ThreadRepository.js';
export { default as MessageRepository } from './db/MessageRepository.js';

// Utilities
export { parseTemplate } from './utils/templateParser.js';
export { default as logger } from './utils/logger.js';