# AI Agent Module

This module provides AI agent functionality using Vercel AI SDK with support for Claude (Anthropic) and Gemini (Google) models.

## Features

- Support for multiple AI models:
  - Claude 3.5 Sonnet
  - Claude 3 Opus
  - Claude 3 Haiku
  - Gemini 1.5 Pro
  - Gemini 1.5 Flash
  - Gemini 2.0 Flash
- Streaming support (text and structured output)
- Structured output with Zod schemas
- JWT authentication required

## Configuration

Add the following environment variables:

```env
# Claude (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Gemini (Google)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

## API Endpoints

### POST /v1/ai-agent/stream
Stream chat with AI agent (supports both text and structured output)

#### Text Streaming
Request body:
```json
{
  "model": "claude-3-5-sonnet",
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "temperature": 0.7,
  "maxTokens": 2000
}
```

Returns a streaming text response.

#### Structured Output Streaming
Request body:
```json
{
  "model": "claude-3-5-sonnet",
  "messages": [
    {
      "role": "user",
      "content": "Extract user information from: John Doe, 30 years old, likes coding and reading"
    }
  ],
  "schemaName": "userProfile",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

Returns a streaming JSON response that conforms to the specified schema.

## Available Schemas

### userProfile
Extracts user profile information:
```typescript
{
  name: string,
  email?: string,
  age?: number,
  preferences: {
    language: string,
    theme: 'light' | 'dark'
  },
  tags: string[]
}
```

### taskCreation
Creates structured task data:
```typescript
{
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high',
  dueDate?: string, // ISO datetime
  assignee?: string,
  tags: string[],
  subtasks?: Array<{
    title: string,
    completed: boolean
  }>
}
```

### sentimentAnalysis
Analyzes sentiment in text:
```typescript
{
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed',
  confidence: number, // 0-1
  emotions?: {
    joy?: number,
    anger?: number,
    fear?: number,
    sadness?: number,
    surprise?: number,
    disgust?: number
  },
  keywords: string[],
  summary?: string
}
```

### dataExtraction
Extracts general data from text:
```typescript
{
  entities: Array<{
    type: string,
    value: string,
    context?: string
  }>,
  keyFacts: Array<{
    fact: string,
    confidence: number
  }>,
  dates?: Array<{
    date: string,
    event: string
  }>,
  numbers?: Array<{
    value: number,
    unit?: string,
    context: string
  }>,
  summary: string
}
```

## Usage Example

### Frontend Example with Structured Output
```typescript
// Using Vercel AI SDK in React
import { useChat } from 'ai/react';

const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/v1/ai-agent/stream',
  body: {
    model: 'claude-3-5-sonnet',
    schemaName: 'userProfile' // Optional: for structured output
  }
});

// The response will be automatically parsed if using structured output
```

### Backend Example
```typescript
// Direct API call
const response = await fetch('/v1/ai-agent/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    model: 'gemini-1.5-pro',
    messages: [
      { role: 'user', content: 'Extract the main topics from this text...' }
    ],
    schemaName: 'dataExtraction',
    temperature: 0.8,
    maxTokens: 1000
  })
});

// Handle streaming response
const reader = response.body.getReader();
// ... process stream
```

## Getting API Keys

1. **Claude (Anthropic)**:
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create an account and generate an API key

2. **Gemini (Google)**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an account and generate an API key

## Security

- All endpoints require JWT authentication
- API keys should never be exposed to the client
- Use environment variables for API keys
- Implement rate limiting for production use