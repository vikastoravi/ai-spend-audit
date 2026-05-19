import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Gets the current logged in user
 * @returns {Promise<Object|null>} User object or null if not logged in
 */
export async function getUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Gets user profile from profiles table
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} Profile object or null if not found
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

/**
 * Signs out the current user
 * @returns {Promise<Object|null>} Error object or null if successful
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      return { error }
    }
    return null
  } catch (error) {
    console.error('Error in signOut:', error)
    return { error }
  }
}