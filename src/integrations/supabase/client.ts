import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://ypzdjqkqwbxeolfrbodk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwemRqcWtxd2J4ZW9sZnJib2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMTQzNTQsImV4cCI6MjA2Mzg5MDM1NH0.8k-VQ5NkW2y5nNiKxt1D_HHalFqHUt_pNf4AzCi_BmU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
