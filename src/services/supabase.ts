import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Authentication functions
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Data functions
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })
  
  return { data, error }
}

export const getUserProfile = async (userId: string) => {
  // Try a simple select first
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId);
  
  // Return first result if array, or null if empty
  return { data: data?.[0] || null, error };
}

export const getConversations = async (productId?: string, executiveId?: string) => {
  let query = supabase
    .from('conversations')
    .select(`
      *,
      products (*),
      user_profiles (*)
    `)
    .order('conversation_timestamp', { ascending: false })

  if (productId) {
    query = query.eq('product_id', productId)
  }
  
  if (executiveId) {
    query = query.eq('executive_id', executiveId)
  }

  const { data, error } = await query
  return { data, error }
}
