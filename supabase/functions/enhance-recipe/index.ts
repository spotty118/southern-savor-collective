import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Loading enhance-recipe function...")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, type, ingredients } = await req.json();
    console.log('Received request:', { type, content, ingredients });

    if (type !== 'instructions') {
      throw new Error('Only instruction enhancement is supported');
    }

    const instructions = Array.isArray(content) ? content : [content];
    const enhancedInstructions: string[] = [];

    const ingredientsList = ingredients 
      ? ingredients.map((ing: any) => `${ing.amount} ${ing.unit} ${ing.item}`).join('\n')
      : '';

    for (const instruction of instructions) {
      const prompt = `Enhance this instruction to be clear and practical:

Ingredients:
${ingredientsList}

Instruction: "${instruction}"

Make it:
1. Clear and direct
2. Include visual cues
3. Add timing if needed
4. Keep original meaning
5. Only use listed ingredients`;

      console.log('Sending prompt to OpenAI:', prompt);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              "role": "system",
              "content": "You are a cooking expert. Be direct and concise. No introductions or conclusions."
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
        ?.replace(/^["']|["']$/g, '')
        ?.replace(/^\d+\.\s*/, '')
        ?.replace(/^(By following these steps,\s*)/i, '')
        ?.replace(/^(Enhanced Instruction:\s*)/i, '')
        ?.replace(/^(Here's the enhanced instruction:\s*)/i, '')
        ?.replace(/^(Enhanced version:\s*)/i, '')
        ?.replace(/^(Instructions?:?\s*)/i, '')
        ?.replace(/^(Steps?:?\s*)/i, '')
        ?.replace(/^(Directions?:?\s*)/i, '')
        ?.replace(/^(Method:?\s*)/i, '')
        ?? instruction;

      enhancedInstructions.push(enhancedInstruction);
    }

    console.log('Enhanced instructions:', enhancedInstructions);

    return new Response(
      JSON.stringify({ enhancedContent: enhancedInstructions }),
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