import { builder } from '@builder.io/react';

// Initialize the Builder SDK with your public API key
builder.init('c40b6b1cd56e4b14b3f9f6be2a1e4d8c');

// Add error handling for initialization
try {
  if (!builder.apiKey) {
    throw new Error('Builder.io API key not properly initialized');
  }
  console.log('Builder.io initialized successfully with API key:', builder.apiKey);
} catch (error) {
  console.error('Builder.io initialization error:', error);
}

export { builder };