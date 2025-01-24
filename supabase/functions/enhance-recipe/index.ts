import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Loading enhance-recipe function...")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, type } = await req.json() as EnhanceRequest;
    console.log('Received request:', { type, content });

    if (type !== 'instructions') {
      throw new Error('Only instruction enhancement is supported');
    }

    // Parse instructions array
    const instructions = Array.isArray(content) ? content : [content];
    const enhancedInstructions: string[] = [];

    // Enhance each instruction individually
    for (const instruction of instructions) {
      const prompt = `As a cooking expert, enhance this specific cooking instruction with clear details and visual cues. Focus on what the cook should look for and key techniques:

Instruction: "${instruction}"

Important guidelines:
1. Keep the exact same meaning and core step
2. Add specific visual cues (e.g. color changes, textures)
3. Include timing indicators where relevant
4. Mention key technique details
5. Keep it practical and clear

Enhanced version:`;

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

      const enhancedInstruction = data.choices[0].message?.content?.trim()
        ?.replace(/^["']|["']$/g, '') // Remove any quotes
        ?.replace(/^\d+\.\s*/, '') // Remove any leading numbers
        ?? instruction; // Fallback to original if enhancement fails

      enhancedInstructions.push(enhancedInstruction);
    }

    console.log('Enhanced instructions:', enhancedInstructions);

    const response: EnhanceResponse = { enhancedContent: enhancedInstructions };
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