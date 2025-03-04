# Integração da Biblioteca @produtive/messages

Este guia orienta como integrar a biblioteca @produtive/messages nas aplicações Zapia e Sender.

## Passos para Integração no Sender

### 1. Adicionar a biblioteca como dependência

Adicione a biblioteca ao `package.json` do Sender:

```json
"dependencies": {
  "@produtive/messages": "github:produtivi/messages"
}
```

Execute:

```bash
npm install
```

### 2. Criar o serviço de contexto de mensagens

Crie um novo arquivo em `src/services/MessageContextService.js`:

1. Copie o conteúdo do arquivo `sender-integration.js` neste diretório
2. Certifique-se de que a chave de API da OpenAI esteja definida nas variáveis de ambiente

### 3. Atualizar o processador de transmissão

Modifique o arquivo `src/jobs/processors/TransmissionProcessor.js`:

1. Adicione o import para o MessageContextService
2. Atualize o método `processRecipient` conforme o exemplo em `transmission-processor-modifications.js`

### 4. Verificar variáveis de ambiente

Certifique-se de que a seguinte variável esteja no arquivo `.env`:

```
OPENAI_API_KEY=sk-sua-chave-de-api-aqui
```

## Testando a Integração

Para verificar se a integração está funcionando corretamente:

1. Envie uma mensagem de template através do Sender
2. Verifique os logs para confirmar que o contexto foi atualizado
3. Consulte o banco de dados para confirmar que a thread e o contexto foram criados/atualizados

## Solução de Problemas

- Se a atualização de contexto falhar, a transmissão continuará normalmente
- Verifique os logs com o prefixo `[MessageContext]` para diagnosticar problemas
- Confirme que as credenciais da OpenAI estão corretas

## Integrações Adicionais

Para integrar com outras aplicações como Zapia, siga um processo semelhante, adaptando para a estrutura específica da aplicação.

## Mais Informações

Consulte a documentação da biblioteca para detalhes completos sobre todas as funcionalidades disponíveis.