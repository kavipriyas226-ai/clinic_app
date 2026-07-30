import { useEffect, useRef, useState } from 'react'
import { Building2, Image, KeyRound, Save, Check, Eye, EyeOff, AlertCircle, X, Pencil } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import { FormField, TextInput, TextArea } from '../components/common/FormField.jsx'
import { updateClinicProfile } from '../api/clinicProfile.js'
import { getAccount, updateAccount } from '../api/account.js'
import { useClinicProfile } from '../context/ClinicProfileContext.jsx'
import logo from '../assets/logo.png'

const tabs = [
  { key: 'profile', label: 'Clinic Profile', icon: Building2 },
  { key: 'account', label: 'Account', icon: KeyRound },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [accountLoading, setAccountLoading] = useState(true)

  const { profile: contextProfile, setProfile: setContextProfile, loading: profileLoading } = useClinicProfile()

  const [profile, setProfile] = useState(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)
  const profileBeforeEdit = useRef(null)

  const [username, setUsername] = useState('')
  const [editingAccount, setEditingAccount] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [accountSaved, setAccountSaved] = useState(false)
  const [accountSaving, setAccountSaving] = useState(false)
  const usernameBeforeEdit = useRef('')

  useEffect(() => {
    if (contextProfile && !profile) {
      setProfile(contextProfile)
    }
  }, [contextProfile, profile])

  useEffect(() => {
    getAccount()
      .then((account) => setUsername(account.username))
      .finally(() => setAccountLoading(false))
  }, [])

  function startEditProfile() {
    profileBeforeEdit.current = profile
    setEditingProfile(true)
  }

  function cancelEditProfile() {
    setProfile(profileBeforeEdit.current)
    setLogoPreview(null)
    setEditingProfile(false)
  }

  function togglePasswordForm() {
    setShowPasswordForm((v) => !v)
    setCurrentPassword('')
    setNewPassword('')
    setAccountError('')
  }

  function startEditAccount() {
    usernameBeforeEdit.current = username
    setEditingAccount(true)
  }

  function cancelEditAccount() {
    setUsername(usernameBeforeEdit.current)
    setShowPasswordForm(false)
    setCurrentPassword('')
    setNewPassword('')
    setAccountError('')
    setEditingAccount(false)
  }

  function updateProfile(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  function handleLogoButtonClick() {
    fileInputRef.current?.click()
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSaveSettings() {
    setSaving(true)
    try {
      const updated = await updateClinicProfile({
        ...profile,
        logoDataUrl: logoPreview || profile.logoDataUrl,
      })
      setProfile(updated)
      setContextProfile(updated)
      setLogoPreview(null)
      setEditingProfile(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAccount(e) {
    e.preventDefault()
    setAccountError('')

    if (!username.trim()) {
      setAccountError('Email cannot be empty.')
      return
    }

    setAccountSaving(true)
    try {
      const updated = await updateAccount({
        username: username.trim(),
        currentPassword: showPasswordForm ? currentPassword : undefined,
        newPassword: showPasswordForm ? newPassword : undefined,
      })
      setUsername(updated.username)
      setCurrentPassword('')
      setNewPassword('')
      setShowPasswordForm(false)
      setEditingAccount(false)
      setAccountSaved(true)
      setTimeout(() => setAccountSaved(false), 1800)
    } catch (err) {
      setAccountError(err.response?.data?.message || 'Could not save account changes.')
    } finally {
      setAccountSaving(false)
    }
  }

  if (profileLoading || accountLoading || !profile) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Loading settings…</p>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage clinic profile and your account" />

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tab nav */}
        <Card className="lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === key
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <Card>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Building2 size={18} className="text-primary-500" /> Clinic Profile
                </h3>
                {!editingProfile && (
                  <Button size="sm" variant="secondary" icon={Pencil} onClick={startEditProfile}>
                    Edit
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-5">Basic information shown on invoices and reports</p>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={logoPreview || profile.logoDataUrl || logo}
                  alt="Clinic logo"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-2xl object-contain bg-white border border-gray-100 shrink-0"
                />
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button size="sm" variant="secondary" icon={Image} onClick={handleLogoButtonClick} disabled={!editingProfile}>
                    Upload Logo
                  </Button>
                  <p className="text-xs text-gray-400 mt-1.5">PNG or JPG, recommended 256x256px</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Clinic Name">
                  <TextInput
                    value={profile.name}
                    onChange={(e) => updateProfile('name', e.target.value)}
                    disabled={!editingProfile}
                    className={!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}
                  />
                </FormField>
                <FormField label="Tagline">
                  <TextInput
                    value={profile.tagline || ''}
                    onChange={(e) => updateProfile('tagline', e.target.value)}
                    disabled={!editingProfile}
                    className={!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}
                  />
                </FormField>
                <FormField label="Phone">
                  <TextInput
                    value={profile.phone || ''}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                    disabled={!editingProfile}
                    className={!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}
                  />
                </FormField>
                <FormField label="Email">
                  <TextInput
                    value={profile.email || ''}
                    onChange={(e) => updateProfile('email', e.target.value)}
                    disabled={!editingProfile}
                    className={!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}
                  />
                </FormField>
                <FormField label="GSTIN">
                  <TextInput
                    value={profile.gstin || ''}
                    onChange={(e) => updateProfile('gstin', e.target.value)}
                    disabled={!editingProfile}
                    className={!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}
                  />
                </FormField>
                <FormField label="Address" className="sm:col-span-2">
                  <TextArea
                    value={profile.address || ''}
                    onChange={(e) => updateProfile('address', e.target.value)}
                    disabled={!editingProfile}
                    className={!editingProfile ? 'opacity-60 cursor-not-allowed' : ''}
                  />
                </FormField>
              </div>

              {editingProfile && (
                <div className="flex justify-end gap-2 mt-5">
                  <Button variant="outline" onClick={cancelEditProfile} disabled={saving}>
                    Cancel
                  </Button>
                  <Button icon={saved ? Check : Save} onClick={handleSaveSettings} disabled={saving}>
                    {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'account' && (
            <Card>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <KeyRound size={18} className="text-primary-500" /> Account
                </h3>
                {!editingAccount && (
                  <Button size="sm" variant="secondary" icon={Pencil} onClick={startEditAccount}>
                    Edit
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-5">
                This application has a single account. The email and password below are the same credentials used to sign in.
              </p>

              <form onSubmit={handleSaveAccount} className="space-y-4 max-w-md">
                <FormField label="Email (Username)" required>
                  <TextInput
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!editingAccount}
                    className={!editingAccount ? 'opacity-60 cursor-not-allowed' : ''}
                  />
                </FormField>

                {editingAccount && !showPasswordForm && (
                  <Button type="button" variant="secondary" icon={KeyRound} onClick={togglePasswordForm}>
                    Change Password
                  </Button>
                )}
                {editingAccount && showPasswordForm && (
                  <div className="space-y-4 p-4 rounded-xl bg-primary-50/40 border border-primary-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">Change Password</p>
                      <button
                        type="button"
                        onClick={togglePasswordForm}
                        className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <FormField label="Current Password" required hint="Required to confirm the password change">
                      <div className="relative">
                        <TextInput
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          className="pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormField>

                    <FormField label="New Password" required hint="Enter the new password">
                      <div className="relative">
                        <TextInput
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormField>
                  </div>
                )}

                {accountError && (
                  <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                    <AlertCircle size={15} className="shrink-0" />
                    {accountError}
                  </div>
                )}

                {editingAccount && (
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={cancelEditAccount} disabled={accountSaving}>
                      Cancel
                    </Button>
                    <Button type="submit" icon={accountSaved ? Check : Save} disabled={accountSaving}>
                      {accountSaving ? 'Saving…' : accountSaved ? 'Saved!' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
