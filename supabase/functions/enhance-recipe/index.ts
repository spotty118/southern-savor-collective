import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Deno types declaration
declare global {
  interface Window {
    Deno: {
      env: {
        get(key: string): string | undefined;
      };
    };
  }
}

const Deno = window.Deno;

interface EnhanceRequest {
  content: string | string[];
  type: 'instructions';
}

interface EnhanceResponse {
  enhancedContent: string[];
}

console.log("Loading enhance-recipe function...");

serve(async (req: Request) => {
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

      interface OpenAIResponse {
        choices?: Array<{
          message?: {
            role: string;
            content?: string;
          };
          finish_reason?: string;
        }>;
        error?: {
          message: string;
        };
      }

      const data = await response.json() as OpenAIResponse;
      
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
      JSON.stringify(response),
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
