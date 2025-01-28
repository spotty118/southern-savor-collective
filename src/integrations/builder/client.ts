import { Builder } from '@builder.io/react';

// Initialize the Builder instance with your public API key
const builder = new Builder('422dc336');

// Register the page model and initialize with options
builder.init('422dc336', {
  // Get content from draft and published versions
  canTrack: false,
  // Ensure we get fresh content
  cachebust: true
});

// Register the page model explicitly
builder.registerComponent('page', { 
  name: 'Page',
  // This tells Builder this is a page component
  isPage: true,
  // Default content if none is provided
  defaults: {
    title: 'Page'
  }
});

export { builder };