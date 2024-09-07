import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase URL and Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Create the Supabase client with session persistence enabled
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Ensures session is persisted between reloads
    autoRefreshToken: true, // Automatically refresh expired tokens
    detectSessionInUrl: true, // Detects session during OAuth redirects
  },
});

// Handle session changes (login, logout, etc.)
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    // Storing additional user information if necessary
    localStorage.setItem('user', JSON.stringify(session.user));
  } else {
    // Clear user data from localStorage when logged out
    localStorage.removeItem('user');
  }
});

// Optional: You can retrieve the current session on app load like this
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
  }
  return session;
};
