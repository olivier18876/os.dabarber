import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dyjwwypqzeksmnvrggai.supabase.co";
const supabaseKey = "sb_publishable_9nWdiiw1ZuUgzkcy9-Slvw__Oo4bbik";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);