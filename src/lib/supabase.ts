import { createClient } from '@supabase/supabase-js';

const REACT_PUBLIC_SUPABASE_URL = 'https://chbskducqoojxtxkpzay.supabase.co';
const REACT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoYnNrZHVjcW9vanh0eGtwemF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMjIzNjU3NCwiZXhwIjoyMDM3ODEyNTc0fQ.BKfFFpx8gO5cvKm3kJmpmTk8UqFQiwSyLYq6TzkS7H0';

export const supabase = createClient(
  REACT_PUBLIC_SUPABASE_URL,
  REACT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);
