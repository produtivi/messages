# @produtive/messages

A library for synchronizing WhatsApp Business API template messages with OpenAI Assistant API threads.

## Installation

```bash
npm install @produtive/messages
```

Or add to your package.json:

```json
"dependencies": {
  "@produtive/messages": "github:produtivi/messages"
}
```

## Usage

```javascript
import { ThreadContextService } from '@produtive/messages';

// Create instances
const threadContextService = new ThreadContextService({
  openaiAdapter,
  threadRepository,
  messageRepository
});

// Use the service to update thread context after sending a template
await threadContextService.updateContextAfterTemplate({
  contactId,
  agentId, 
  templateName,
  templateParams,
  messageId
});
```

## Features

- Thread management between agents and contacts
- Template message sending with variable support
- Message history tracking in database
- Integration with OpenAI Assistant API

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## License

Private. Unauthorized use, reproduction or distribution is prohibited.