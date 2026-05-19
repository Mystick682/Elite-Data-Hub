// Get these from Supabase Project Settings > API
const SUPABASE_URL = "https://rsbafxjhtsythoylkcua.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYmFmeGpodHN5dGhveWxrY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTgxMTMsImV4cCI6MjA5NDYzNDExM30.AVos9bQj3c2Ch-Li1FgId5Z4DbIlmF1RKBrm7vSSc2c";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);