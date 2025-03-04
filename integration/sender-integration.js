/**
 * Integração da biblioteca @produtive/messages com o Sender
 * 
 * Instruções: Adicione este arquivo em src/services/MessageContextService.js no projeto Sender
 * e modifique o TransmissionProcessor.js para usá-lo.
 */
import { 
  ThreadContextService, 
  OpenAIAdapter, 
  ThreadRepository, 
  MessageRepository 
} from '@produtive/messages';
import logger from '../utils/logger.js';
import { sql } from '../database/db.js';

class MessageContextService {
  constructor() {
    // Obter credenciais da OpenAI do ambiente
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      logger.warn('[MessageContext] OpenAI API Key não encontrada nas variáveis de ambiente');
    }
    
    // Inicializar componentes
    this.openaiAdapter = new OpenAIAdapter({
      apiKey: openaiApiKey
    });
    
    // Inicializar repositórios com conexão do banco compartilhada
    this.threadRepository = new ThreadRepository({ db: sql });
    this.messageRepository = new MessageRepository({ db: sql });
    
    // Inicializar serviço principal
    this.threadContextService = new ThreadContextService({
      openaiAdapter: this.openaiAdapter,
      threadRepository: this.threadRepository,
      messageRepository: this.messageRepository
    });
    
    logger.info('[MessageContext] Serviço de contexto de mensagens inicializado');
  }
  
  /**
   * Atualiza o contexto da thread após o envio de um template
   * 
   * @param {Object} options Opções para atualização
   * @param {number} options.agentId ID do agente
   * @param {number} options.contactId ID do contato
   * @param {string} options.templateName Nome do template
   * @param {Array} options.templateParams Parâmetros do template
   * @param {string} options.messageId ID da mensagem enviada (wamid)
   * @returns {Promise<Object>} Resultado da operação
   */
  async updateContextAfterTemplate(options) {
    try {
      logger.info('[MessageContext] Atualizando contexto após envio de template', {
        agentId: options.agentId,
        contactId: options.contactId,
        templateName: options.templateName,
        messageId: options.messageId
      });
      
      const result = await this.threadContextService.updateContextAfterTemplate({
        agentId: options.agentId,
        contactId: options.contactId,
        templateName: options.templateName,
        templateParams: options.templateParams,
        messageId: options.messageId
      });
      
      logger.info('[MessageContext] Contexto atualizado com sucesso', {
        threadId: result.threadId,
        openaiThreadId: result.openaiThreadId
      });
      
      return result;
    } catch (error) {
      logger.error('[MessageContext] Erro ao atualizar contexto', {
        error: error.message,
        stack: error.stack
      });
      
      // Não interrompe o fluxo principal se falhar
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Exportar uma instância única
export default new MessageContextService();