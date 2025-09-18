import { createClient } from "@supabase/supabase-js";

const supabaseURL=import.meta.env.VITE_SUPABASE_URL
const supabaseAnnonKey=import.meta.env.VITE_SUPABASE_ANNON_KEY

const supabase=createClient(supabaseURL,supabaseAnnonKey, {
    auth:{
        persistSession:true,
        autoRefreshToken:true

    },
    realtime:{
        eventsPerSecond: 10

    }
})

export default supabase;