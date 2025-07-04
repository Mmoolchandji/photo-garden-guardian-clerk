import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// use this while the app is in development or testing.
const supabaseUrl = "https://ypzdjqkqwbxeolfrbodk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwemRqcWtxd2J4ZW9sZnJib2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMTQzNTQsImV4cCI6MjA2Mzg5MDM1NH0.8k-VQ5NkW2y5nNiKxt1D_HHalFqHUt_pNf4AzCi_BmU";

// Use this when you publish the app or run it in production.

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error("Supabase URL and Anon Key must be defined in .env file");
// }


// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
