
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://siqwvvblyrmciwukbsxq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcXd2dmJseXJtY2l3dWtic3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjQ5NDcsImV4cCI6MjA4Mzk0MDk0N30.iy6HYmcLPqKnvkOeQJsDFALEW8nQwQIj9UtNRwq8mzw';

export const supabase = createClient(supabaseUrl, supabaseKey);
