import { supabase } from '../utils/supabaseClient'

export const notificationService = {
  async getMyNotifications(limit = 50, offset = 0) {
    const { data, error } = await supabase.rpc('get_my_notifications', {
      p_limit: limit,
      p_offset: offset,
    })
    if (error) throw error
    return data
  },

  async markNotificationRead(notificationId) {
    const { data, error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId,
    })
    if (error) throw error
    return data
  },

  async markAllNotificationsRead() {
    const { data, error } = await supabase.rpc('mark_all_notifications_read')
    if (error) throw error
    return data
  },

  async getUnreadCount() {
    const { data, error } = await supabase.rpc('get_unread_notification_count')
    if (error) throw error
    return data
  },
}
