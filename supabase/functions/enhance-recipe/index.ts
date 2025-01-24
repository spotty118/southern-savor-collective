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
      const prompt = `Enhance this single cooking instruction step to be clear and natural, while preserving its unique actions and measurements:

Ingredients List:
${ingredientsList}

Original Step: "${instruction}"

Requirements:
1. Keep this specific step's unique actions and measurements
2. Use clear, natural language
3. Convert any decimal measurements to fractions
4. Remove formatting or markers
5. Focus only on the essential cooking actions
6. Keep the original meaning intact
7. Don't add new ingredients or steps
8. Don't repeat information from other steps
9. Don't provide multiple variations
10. Don't add commentary or timing indicators

Output the enhanced step as a single, clear instruction.`;

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
              "content": "You are a cooking expert that enhances recipe instructions. Keep each step's unique actions while making them clearer and more natural."
            },
            {
              "role": "user",
              "content": prompt
            }
          ],
          temperature: 0.4, // Lower temperature for more consistent output
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
        ?.replace(/^(Enhanced:?\s*)/i, '')
        ?.replace(/^(Step:?\s*)/i, '')
        ?.replace(/^(Instruction:?\s*)/i, '')
        ?.replace(/\*\*/g, '')
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