import { supabase } from '../utils/supabaseClient'

export const authService = {
  async signUp(email, password) {
    return await supabase.auth.signUp({ email, password })
  },

  async signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  async signOut() {
    return await supabase.auth.signOut()
  },

  async getSession() {
    return await supabase.auth.getSession()
  },

  async getUser() {
    return await supabase.auth.getUser()
  },
}
