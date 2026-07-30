import client from './client.js'

export async function getNotifications() {
  const { data } = await client.get('/notifications')
  return data
}

export async function getUnreadNotificationCount() {
  const { data } = await client.get('/notifications/unread-count')
  return data.count
}

export async function markNotificationRead(id) {
  const { data } = await client.put(`/notifications/${id}/read`)
  return data
}

export async function markAllNotificationsRead() {
  await client.put('/notifications/read-all')
}
