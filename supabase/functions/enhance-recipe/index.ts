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

    const isInstructions = type === 'instructions';
    const prompt = isInstructions 
      ? `Enhance this single cooking instruction step to be clear and natural, while preserving its unique actions and measurements:

Ingredients List:
${ingredients ? ingredients.map((ing: any) => `${ing.amount} ${ing.unit} ${ing.item}`).join('\n') : ''}

Original Step: "${content}"

1. Preserve Unique Details
   - Keep all original measurements and actions intact.

2. Use Clear, Natural Language
   - Make the text easy to understand.

3. Convert Measurements
   - Change decimal measurements to fractions (e.g., 0.5 → ½).
   - Convert spelled-out temperatures to numeric form with the °F symbol (e.g., "four hundred degrees Fahrenheit" → "400°F").
   - Use standard abbreviations (tbsp, tsp, cup, oz, lb, etc.).

4. Remove Extras
   - No added formatting (bold, italics, etc.).
   - No commentary or timing indicators.
   - No new ingredients or steps.
   - No repeated information or multiple variations.

5. Output One Instruction
   - Present the final version as a single, concise step, preserving the original meaning but focusing only on essential cooking actions.

6. Convert spelled-out numbers in measurements into numeric form
      
7. For any mention of "degrees Fahrenheit," convert it to "°F" and keep the numeric value`
      : `Enhance this recipe description with Southern charm and warmth:

Original Description: "${content}"

Guidelines:
1. Keep the core meaning intact
2. Add warmth and Southern hospitality to the tone
3. Make it inviting and personal
4. Keep it concise and natural
5. Don't add specific ingredients or steps
6. Focus on the emotional appeal and tradition
7. Maintain proper grammar and clarity`;

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
            "content": isInstructions 
              ? "You are a cooking expert that enhances recipe instructions. Keep each step's unique actions while making them clearer and more natural."
              : "You are a Southern cookbook author who adds warmth and charm to recipe descriptions while keeping them authentic and inviting."
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('No content received from OpenAI:', data);
      throw new Error('No content received from OpenAI');
    }

    const enhancedContent = data.choices[0].message?.content?.trim()
      ?.replace(/^["']|["']$/g, '')
      ?.replace(/^\d+\.\s*/, '')
      ?.replace(/^(Enhanced:?\s*)/i, '')
      ?.replace(/^(Step:?\s*)/i, '')
      ?.replace(/^(Instruction:?\s*)/i, '')
      ?.replace(/\*\*/g, '')
      ?.replace(/(\d+)\s*degrees?\s*Fahrenheit/gi, '$1°F')
      ?? content;

    console.log('Enhanced content:', enhancedContent);

    return new Response(
      JSON.stringify({ enhancedContent: isInstructions ? [enhancedContent] : enhancedContent }),
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