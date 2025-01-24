import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, type, singleInstruction } = await req.json();
    console.log('Received request:', { type, singleInstruction, content });

    let prompt = '';
    if (type === 'instructions') {
      prompt = `As a Southern cooking expert, enhance these cooking instructions with more detailed steps, cooking tips, and Southern charm. Make it warm and inviting, like a grandmother sharing her secrets:

${content}

Please provide ONE enhanced instruction that maintains the same meaning but adds Southern warmth. Keep it brief but clear.`;
    } else if (type === 'description') {
      prompt = `As a Southern food writer, enhance this recipe description with more warmth, charm, and storytelling elements that capture the essence of Southern cooking. Keep the response concise and focused:

${content}

Please provide an enhanced description that makes the recipe more inviting and authentic to Southern cuisine.`;
    }

    console.log('Sending prompt to OpenAI:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful Southern cooking expert who enhances recipe content with warmth and authenticity while keeping instructions clear and concise. Never change the meaning or steps of the instructions.' 
          },
          { role: 'user', content: prompt }
        ],
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enhance-recipe function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
