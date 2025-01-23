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
    const { content, type } = await req.json();

    let prompt = '';
    if (type === 'instructions') {
      prompt = `As a Southern cooking expert, enhance these cooking instructions with more detailed steps, cooking tips, and Southern charm. Make it warm and inviting, like a grandmother sharing her secrets:

${content}

Please provide enhanced instructions that maintain the same steps but add more detail and Southern flair.`;
    } else if (type === 'description') {
      prompt = `As a Southern food writer, enhance this recipe description with more warmth, charm, and storytelling elements that capture the essence of Southern cooking:

${content}

Please provide an enhanced description that makes the recipe more inviting and authentic to Southern cuisine.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful Southern cooking expert who enhances recipe content with warmth and authenticity.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;

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