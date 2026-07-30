import client from './client.js'

export async function getClinicProfile() {
  const { data } = await client.get('/clinic-profile')
  return data
}

export async function updateClinicProfile(profile) {
  const { data } = await client.put('/clinic-profile', profile)
  return data
}
