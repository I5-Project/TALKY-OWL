import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export const PROFILE_IMAGES_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_PROFILE_IMAGES ?? 'profile-images'
