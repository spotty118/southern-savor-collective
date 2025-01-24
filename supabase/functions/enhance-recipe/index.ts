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
      prompt = `You are a Southern cooking expert. Please enhance the following cooking instruction with Southern charm and flair, while maintaining the exact same meaning and steps. Make it warm and inviting, like a Southern grandmother would explain it:

${content}

Important: Keep the exact same meaning and steps, just make it more Southern and charming.`;
    } else {
      prompt = `You are a Southern cooking expert. Here's a recipe description:

${content}

Please provide an enhanced description that makes the recipe more inviting and authentic to Southern cuisine.`;
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
            "content": "You are a helpful Southern cooking expert who enhances recipe instructions and descriptions with Southern charm while maintaining their exact meaning."
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