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

    // Parse instructions array
    const instructions = Array.isArray(content) ? content : [content];
    const enhancedInstructions: string[] = [];

    // Format ingredients for context
    const ingredientsList = ingredients 
      ? ingredients.map((ing: any) => `${ing.amount} ${ing.unit} ${ing.item}`).join('\n')
      : '';

    // Enhance each instruction individually
    for (const instruction of instructions) {
      const prompt = `Enhance this cooking instruction with clear details and visual cues:

Available Ingredients:
${ingredientsList}

Instruction: "${instruction}"

Guidelines:
1. Keep exact meaning and core step
2. Add visual cues (color changes, textures)
3. Include timing indicators
4. Add technique details
5. Keep practical and clear
6. Be concise but complete
7. Only use listed ingredients

Response:`;

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
              "content": "You are a cooking expert. Enhance instructions to be clear and practical. Be direct and concise."
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
        ?.replace(/^["']|["']$/g, '') // Remove quotes
        ?.replace(/^\d+\.\s*/, '') // Remove leading numbers
        ?.replace(/^(By following these steps,\s*)/i, '') // Remove "By following these steps"
        ?.replace(/^(Enhanced Instruction:\s*)/i, '') // Remove "Enhanced Instruction:"
        ?.replace(/^(Here's the enhanced instruction:\s*)/i, '') // Remove "Here's the enhanced instruction:"
        ?.replace(/^(Enhanced version:\s*)/i, '') // Remove "Enhanced version:"
        ?? instruction; // Fallback to original if enhancement fails

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