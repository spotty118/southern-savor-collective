import { Builder } from '@builder.io/react';

// Initialize the Builder instance with your public API key
const builder = new Builder('422dc336');

// Initialize builder with your API key
builder.init('422dc336');

// Register the page model using the static method
Builder.registerComponent('page', { 
  name: 'Page',
  inputs: [], // Define any inputs the component accepts
  defaults: {
    component: {
      name: 'Page',
      options: {
        title: 'Page'
      }
    }
  }
});

export { builder };