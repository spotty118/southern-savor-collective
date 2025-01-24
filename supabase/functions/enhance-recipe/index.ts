import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Security headers
const securityHeaders = {
  'Access-Control-Allow-Origin': 'https://your-production-domain.com', // Restrict to your domain
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'none'; connect-src 'self' https://api.openai.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
}

// Validation schemas
const IngredientSchema = z.object({
  amount: z.string().min(1).max(50),
  unit: z.string().min(1).max(50),
  item: z.string().min(1).max(100)
})

const RequestSchema = z.object({
  content: z.union([z.string(), z.array(z.string())]),
  type: z.enum(['instructions', 'description']),
  singleInstruction: z.boolean().optional(),
  ingredients: z.array(IngredientSchema).optional()
})

const OpenAIResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.string()
    })
  })).min(1)
})

// Rate limiting using Deno's cache API
class RateLimiter {
  private cache = new Map<string, { count: number; timestamp: number }>();
  private window = 60 * 1000; // 1 minute
  private limit = 10; // requests per window

  async isLimited(key: string): Promise<boolean> {
    const now = Date.now();
    const record = this.cache.get(key);

    if (!record || now - record.timestamp > this.window) {
      this.cache.set(key, { count: 1, timestamp: now });
      return false;
    }

    if (record.count >= this.limit) {
      return true;
    }

    record.count++;
    return false;
  }
}

const rateLimiter = new RateLimiter();

// Content sanitization
function sanitizeContent(content: string): string {
  return content
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/['"]/g, '') // Remove quotes
    .trim();
}

console.log("Loading enhance-recipe function...")

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: securityHeaders })
  }

  // Validate request method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        status: 405
      }
    )
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    if (await rateLimiter.isLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { 
          headers: { ...securityHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      )
    }

    // Validate request body
    const body = await req.json();
    const validatedData = RequestSchema.parse(body);
    
    // Currently only supporting instruction enhancement
    if (validatedData.type !== 'instructions') {
      throw new Error('Only instruction enhancement is supported');
    }

    const instructions = Array.isArray(validatedData.content) 
      ? validatedData.content 
      : [validatedData.content];

    const enhancedInstructions: string[] = [];

    // Validate and sanitize ingredients list
    const ingredientsList = validatedData.ingredients 
      ? validatedData.ingredients
          .map(ing => `${ing.amount} ${ing.unit} ${ing.item}`)
          .map(sanitizeContent)
          .join('\n')
      : '';

    for (const instruction of instructions) {
      const sanitizedInstruction = sanitizeContent(instruction);
      
      if (!sanitizedInstruction) {
        continue;
      }

      const prompt = `Enhance this single cooking instruction step to be clear and natural, while preserving its unique actions and measurements:

Ingredients List:
${ingredientsList}

Original Step: "${sanitizedInstruction}"

1. Preserve Unique Details
   - Keep all original measurements and actions intact.

2. Use Clear, Natural Language
   - Make the text easy to understand.

3. Convert Measurements
   - Change decimal measurements to fractions (e.g., 0.5 → ½).
   - Convert spelled-out temperatures to numeric form with the °F symbol.
   - Use standard abbreviations (tbsp, tsp, cup, oz, lb, etc.).

4. Remove Extras
   - No added formatting.
   - No commentary or timing indicators.
   - No new ingredients or steps.
   - No repeated information.`;

      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "gpt-4",
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
            temperature: 0.3,
            max_tokens: 150,
          }),
        });

        if (!openAIResponse.ok) {
          throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
        }

        const data = await openAIResponse.json();
        const validatedResponse = OpenAIResponseSchema.parse(data);

        const enhancedInstruction = validatedResponse.choices[0].message.content
          .replace(/^["']|["']$/g, '')
          .replace(/^\d+\.\s*/, '')
          .replace(/^(Enhanced:?\s*)/i, '')
          .replace(/^(Step:?\s*)/i, '')
          .replace(/^(Instruction:?\s*)/i, '')
          .replace(/\*\*/g, '')
          .replace(/(\d+)\s*degrees?\s*Fahrenheit/gi, '$1°F')
          .trim();

        enhancedInstructions.push(enhancedInstruction);
      } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('Failed to enhance instruction');
      }
    }

    return new Response(
      JSON.stringify({ enhancedContent: enhancedInstructions }),
      { 
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error);
    
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof z.ZodError ? error.errors : undefined
      }),
      { 
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      },
    )
  }
})