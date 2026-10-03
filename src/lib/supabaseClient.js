import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://emcbpoliqbxoqeojobxg.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_FMyRHwB5zheKYJHOolcW1w_9pyqLm9T';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
