import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://ivvwdsmwcdqycrbzidvo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dndkc213Y2RxeWNyYnppZHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNTU4NzYsImV4cCI6MjA5OTYzMTg3Nn0.jDFB6u2gYkzvOiYeAjq5n7Sgp4heh9j2-BlGPpx0ID4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
