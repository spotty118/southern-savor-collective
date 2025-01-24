import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Loading enhance-recipe function...")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, type, singleInstruction } = await req.json();
    console.log('Received request:', { type, singleInstruction, content });

    let prompt = '';
    if (type === 'instructions') {
      prompt = `You are a cooking expert. Please enhance the following cooking instruction by adding helpful details and visual cues while maintaining the exact same meaning and steps:

${content}

Important: Keep the exact same meaning and steps, just add clear, practical details that help ensure success.`;
    } else {
      prompt = `You are a Southern cooking expert. Here's a recipe description:

${content}

Please provide an enhanced description that highlights the key flavors and techniques while maintaining authenticity.`;
    }

    console.log('Sending prompt to OpenAI:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            "role": "system",
            "content": "You are a helpful cooking expert who enhances recipe instructions with clear, practical details while maintaining their exact meaning."
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('No content received from OpenAI:', data);
      throw new Error('No content received from OpenAI');
    }

    const enhancedContent = data.choices[0].message.content.trim();
    console.log('Enhanced content:', enhancedContent);

    return new Response(
      JSON.stringify({ enhancedContent }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})
