import { Builder } from '@builder.io/react';

// Initialize the Builder instance with your public API key
const builder = new Builder('422dc336');

// Register the page model
builder.init('422dc336');

// Tell builder to only render JSON
Builder.isStatic = true;

export { builder };