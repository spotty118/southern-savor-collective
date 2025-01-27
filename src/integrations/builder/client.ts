import { Builder } from '@builder.io/react';

// Initialize the Builder instance with your public API key
const builder = new Builder({
  apiKey: '422dc336'
});

// Optional: Register custom components
// builder.registerComponent(YourComponent, { name: 'Custom Component' });

export { builder };