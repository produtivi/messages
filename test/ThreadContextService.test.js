/**
 * Tests for ThreadContextService
 */
import { jest } from '@jest/globals';
import ThreadContextService from '../src/ThreadContextService.js';

// Mock dependencies
const mockOpenaiAdapter = {
  createThread: jest.fn(),
  addMessageToThread: jest.fn()
};

const mockThreadRepository = {
  findByContactAndAgent: jest.fn(),
  create: jest.fn(),
  updateLastInteraction: jest.fn()
};

const mockMessageRepository = {
  updateWithContext: jest.fn()
};

// Mock the template parser
jest.mock('../src/utils/templateParser.js', () => ({
  parseTemplate: jest.fn().mockResolvedValue('Parsed template content')
}));

// Create a test instance
const service = new ThreadContextService({
  openaiAdapter: mockOpenaiAdapter,
  threadRepository: mockThreadRepository,
  messageRepository: mockMessageRepository
});

describe('ThreadContextService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  describe('updateContextAfterTemplate', () => {
    it('should update thread context after sending a template', async () => {
      // Setup mocks
      const existingThread = {
        id: 123,
        openai_id: 'thread_abc123',
        contact_id: 456,
        agent_id: 789
      };
      
      mockThreadRepository.findByContactAndAgent.mockResolvedValue(existingThread);
      mockOpenaiAdapter.addMessageToThread.mockResolvedValue({ id: 'msg_123' });
      mockMessageRepository.updateWithContext.mockResolvedValue(true);
      mockThreadRepository.updateLastInteraction.mockResolvedValue(true);
      
      // Call the method
      const result = await service.updateContextAfterTemplate({
        contactId: 456,
        agentId: 789,
        templateName: 'welcome_template',
        templateParams: ['Customer', '12345'],
        messageId: 'wa_msg_123'
      });
      
      // Verify result
      expect(result).toEqual({
        success: true,
        threadId: 123,
        openaiThreadId: 'thread_abc123'
      });
      
      // Verify interactions
      expect(mockThreadRepository.findByContactAndAgent).toHaveBeenCalledWith(456, 789);
      expect(mockOpenaiAdapter.addMessageToThread).toHaveBeenCalledWith({
        threadId: 'thread_abc123',
        content: 'Parsed template content',
        role: 'assistant'
      });
      expect(mockMessageRepository.updateWithContext).toHaveBeenCalledWith({
        messageId: 'wa_msg_123',
        contextId: 123,
        contextFrom: 'agent'
      });
      expect(mockThreadRepository.updateLastInteraction).toHaveBeenCalledWith({
        threadId: 123,
        lastMessageFrom: 'agent'
      });
    });
    
    it('should create a new thread if one does not exist', async () => {
      // Setup mocks
      mockThreadRepository.findByContactAndAgent.mockResolvedValue(null);
      mockOpenaiAdapter.createThread.mockResolvedValue({ id: 'new_thread_123' });
      mockThreadRepository.create.mockResolvedValue({
        id: 456,
        openai_id: 'new_thread_123',
        contact_id: 789,
        agent_id: 101
      });
      mockOpenaiAdapter.addMessageToThread.mockResolvedValue({ id: 'msg_456' });
      mockMessageRepository.updateWithContext.mockResolvedValue(true);
      mockThreadRepository.updateLastInteraction.mockResolvedValue(true);
      
      // Call the method
      const result = await service.updateContextAfterTemplate({
        contactId: 789,
        agentId: 101,
        templateName: 'welcome_template',
        templateParams: ['Customer', '67890'],
        messageId: 'wa_msg_456'
      });
      
      // Verify result
      expect(result).toEqual({
        success: true,
        threadId: 456,
        openaiThreadId: 'new_thread_123'
      });
      
      // Verify interactions
      expect(mockThreadRepository.findByContactAndAgent).toHaveBeenCalledWith(789, 101);
      expect(mockOpenaiAdapter.createThread).toHaveBeenCalled();
      expect(mockThreadRepository.create).toHaveBeenCalledWith({
        contactId: 789,
        agentId: 101,
        openaiId: 'new_thread_123'
      });
      expect(mockOpenaiAdapter.addMessageToThread).toHaveBeenCalledWith({
        threadId: 'new_thread_123',
        content: 'Parsed template content',
        role: 'assistant'
      });
    });
  });
});