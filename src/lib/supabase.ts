import { createClient } from '@supabase/supabase-js';

// Datos PÚBLICOS del proyecto Supabase (la "publishable key" está hecha para ir en el navegador).
// La seguridad la ponen las reglas RLS de la base de datos (ver supabase/schema.sql).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qupydtmqiowjysqhqsww.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_9pGhggqwr6GZgvtopjjzYA_WsWwN0uQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// Correo del administrador (debe coincidir con public.is_admin() en la base de datos)
export const ADMIN_EMAIL = 'miguelgraphalterna@gmail.com';
