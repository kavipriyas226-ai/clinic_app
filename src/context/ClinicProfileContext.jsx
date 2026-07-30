import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getClinicProfile } from '../api/clinicProfile.js'

const ClinicProfileContext = createContext(null)

export function ClinicProfileProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    return getClinicProfile()
      .then(setProfile)
      .catch(() => {})
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return (
    <ClinicProfileContext.Provider value={{ profile, setProfile, refresh, loading }}>
      {children}
    </ClinicProfileContext.Provider>
  )
}

export function useClinicProfile() {
  const ctx = useContext(ClinicProfileContext)
  if (!ctx) throw new Error('useClinicProfile must be used within a ClinicProfileProvider')
  return ctx
}
