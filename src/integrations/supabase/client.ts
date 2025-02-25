import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://opmmlnbhmlisiqiuvtwo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbW1sbmJobWxpc2lxaXV2dHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1ODYxMDUsImV4cCI6MjA1MzE2MjEwNX0.PlSa0XGAf7jo3Zy9lGEfa2336s-LdVkqD68zDkA5KqE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
