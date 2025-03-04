/**
 * Modificações necessárias para o TransmissionProcessor.js no Sender
 * 
 * Instruções: 
 * 1. Importe o MessageContextService
 * 2. Atualize o método processRecipient para chamar o serviço após enviar o template
 */

// 1. Adicione este import no topo do arquivo TransmissionProcessor.js:
import MessageContextService from '../../services/MessageContextService.js';

// 2. Modifique o método processRecipient conforme abaixo:

// VERSÃO ATUAL:
async processRecipient(transmission, recipient) {
  try {
    logger.info('[DEBUG-TP] Iniciando processamento de recipient', {
      transmissionId: transmission.id,
      recipientId: recipient.id,
      phone: recipient.phone,
      contactName: recipient.contact_name
    });
    
    const variables = this.prepareTemplateVariables(transmission, recipient);

    logger.info('[DEBUG-TP] Chamando WhatsAppService.sendTemplate', {
      transmissionId: transmission.id,
      recipientId: recipient.id,
      agentId: transmission.agent_id,
      phone: recipient.phone,
      templateName: transmission.template_name,
      variables
    });

    const result = await this.whatsappService.sendTemplate(
      transmission.agent_id,
      recipient.phone,
      transmission.template_name,
      variables
    );

    logger.info('[DEBUG-TP] Resposta do envio de template recebida', {
      transmissionId: transmission.id,
      recipientId: recipient.id,
      success: true,
      messageId: result.messages && result.messages[0] ? result.messages[0].id : 'unknown'
    });

    logger.info('[DEBUG-TP] Atualizando status do recipient no banco', {
      transmissionId: transmission.id,
      recipientId: recipient.id,
      newStatus: 'sent',
      messageId: result.messages[0].id
    });
    
    await sql(
      queries.updateRecipientStatus,
      [
        'sent',
        result.messages[0].id,
        'sent',
        'sent',
        'sent',
        recipient.id
      ]
    );

    logger.info('[DEBUG-TP] Mensagem enviada com sucesso', {
      transmissionId: transmission.id,
      recipientId: recipient.id,
      messageId: result.messages[0].id
    });
  } catch (error) {
    // ... restante do código
  }
}

// NOVA VERSÃO:
async processRecipient(transmission, recipient) {
  try {
    logger.info('[DEBUG-TP] Iniciando processamento de recipient', {
      transmissionId: transmission.id,
      recipientId: recipient.id,
      phone: recipient.phone,
      contactName: recipient.contact_name
    });
    
    const variables = this.prepareTemplateVariables(transmission, recipient);

    logger.info('[DEBUG-TP] Chamando WhatsAppService.sendTemplate', {
      transmissionId: transmission.id,
      recipientId: recipient.id,
      agentId: transmission.agent_id,
      phone: recipient.phone,
      templateName: transmission.template_name,
      variables
    });

    const result = await this.whatsappService.sendTemplate(
      transmission.agent_id,
      recipient.phone,
      transmission.template_name,
      variables
    );

    logger.info('[DEBUG-TP] Resposta do envio de template recebida', {
      transmissionId: transmission.id,
      recipientId: recipient.id,
      success: true,
      messageId: result.messages && result.messages[0] ? result.messages[0].id : 'unknown'
    });

    // Obter o messageId da resposta
    const messageId = result.messages && result.messages[0] ? result.messages[0].id : null;

    // Atualizar o contexto da thread na OpenAI e no banco
    if (messageId) {
      try {
        logger.info('[DEBUG-TP] Atualizando contexto da thread com MessageContextService', {
          transmissionId: transmission.id,
          recipientId: recipient.id,
          contactId: recipient.company_contact_id,
          agentId: transmission.agent_id,
          messageId: messageId
        });
        
        // Chamar o serviço para atualizar o contexto
        const contextResult = await MessageContextService.updateContextAfterTemplate({
          agentId: transmission.agent_id,
          contactId: recipient.company_contact_id,
          templateName: transmission.template_name,
          templateParams: variables,
          messageId: messageId
        });
        
        logger.info('[DEBUG-TP] Resultado da atualização de contexto', {
          transmissionId: transmission.id,
          recipientId: recipient.id,
          success: contextResult.success,
          threadId: contextResult.threadId,
          openaiThreadId: contextResult.openaiThreadId
        });
      } catch (contextError) {
        // Log do erro, mas continua o processamento
        logger.error('[DEBUG-TP] Erro ao atualizar contexto da thread', {
          transmissionId: transmission.id,
          recipientId: recipient.id,
          error: contextError.message,
          stack: contextError.stack
        });
      }
    }

    logger.info('[DEBUG-TP] Atualizando status do recipient no banco', {
      transmissionId: transmission.id,
      recipientId: recipient.id,
      newStatus: 'sent',
      messageId: messageId
    });
    
    await sql(
      queries.updateRecipientStatus,
      [
        'sent',
        messageId,
        'sent',
        'sent',
        'sent',
        recipient.id
      ]
    );

    logger.info('[DEBUG-TP] Mensagem enviada com sucesso', {
      transmissionId: transmission.id,
      recipientId: recipient.id,
      messageId: messageId
    });
  } catch (error) {
    // ... restante do código
  }
}