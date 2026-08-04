import { useEffect, useRef, useState } from 'react'
import {
  Building2, Image, Users as UsersIcon, Save, Check, AlertCircle, Pencil, Plus, Trash2,
  KeyRound, ShieldCheck, User as UserIcon, ToggleLeft, ToggleRight,
} from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import { FormField, TextInput, TextArea, Select } from '../components/common/FormField.jsx'
import { updateClinicProfile } from '../api/clinicProfile.js'
import { getUsers, createUser, updateUser, deleteUser } from '../api/users.js'
import { useClinicProfile } from '../context/ClinicProfileContext.jsx'
import { isAdmin } from '../api/client.js'
import logo from '../assets/logo.png'

export default function Settings() {
  const admin = isAdmin()
  const tabs = admin
    ? [{ key: 'profile', label: 'Clinic Profile', icon: Building2 }, { key: 'users', label: 'Users', icon: UsersIcon }]
    : [{ key: 'profile', label: 'Clinic Profile', icon: Building2 }]

  const [activeTab, setActiveTab] = useState('profile')

  const { profile: contextProfile, setProfile: setContextProfile, loading: profileLoading } = useClinicProfile()

  const [profile, setProfile] = useState(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)
  const profileBeforeEdit = useRef(null)

  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editUserTarget, setEditUserTarget] = useState(null)
  const [resetPasswordTarget, setResetPasswordTarget] = useState(null)
  const [deleteUserTarget, setDeleteUserTarget] = useState(null)
  const [userError, setUserError] = useState('')

  useEffect(() => {
    if (contextProfile && !profile) {
      setProfile(contextProfile)
    }
  }, [contextProfile, profile])

  useEffect(() => {
    if (!admin) {
      setUsersLoading(false)
      return
    }
    refreshUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin])

  function refreshUsers() {
    setUsersLoading(true)
    getUsers()
      .then(setUsers)
      .finally(() => setUsersLoading(false))
  }

  function startEditProfile() {
    profileBeforeEdit.current = profile
    setEditingProfile(true)
  }

  function cancelEditProfile() {
    setProfile(profileBeforeEdit.current)
    setLogoPreview(null)
    setEditingProfile(false)
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

  async function handleAddUser(e) {
    e.preventDefault()
    setUserError('')
    const form = new FormData(e.target)
    const payload = {
      username: form.get('username').trim(),
      password: form.get('password'),
      role: form.get('role'),
      enabled: form.get('enabled') === 'on',
    }
    try {
      const created = await createUser(payload)
      setUsers((prev) => [...prev, created])
      setShowAddUser(false)
    } catch (err) {
      setUserError(err.response?.data?.message || 'Could not create user.')
    }
  }

  async function handleEditUser(e) {
    e.preventDefault()
    setUserError('')
    const form = new FormData(e.target)
    const payload = {
      username: form.get('username').trim(),
      role: form.get('role'),
      enabled: form.get('enabled') === 'on',
      newPassword: '',
    }
    try {
      const updated = await updateUser(editUserTarget.id, payload)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setEditUserTarget(null)
    } catch (err) {
      setUserError(err.response?.data?.message || 'Could not update user.')
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setUserError('')
    const form = new FormData(e.target)
    const newPassword = form.get('newPassword')
    const confirmPassword = form.get('confirmPassword')
    if (newPassword !== confirmPassword) {
      setUserError('Passwords do not match.')
      return
    }
    try {
      await updateUser(resetPasswordTarget.id, {
        username: resetPasswordTarget.username,
        role: resetPasswordTarget.role,
        enabled: resetPasswordTarget.enabled,
        newPassword,
      })
      setResetPasswordTarget(null)
    } catch (err) {
      setUserError(err.response?.data?.message || 'Could not reset password.')
    }
  }

  async function handleToggleEnabled(user) {
    setUserError('')
    try {
      const updated = await updateUser(user.id, {
        username: user.username,
        role: user.role,
        enabled: !user.enabled,
        newPassword: '',
      })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setUserError(err.response?.data?.message || 'Could not update user.')
    }
  }

  async function confirmDeleteUser() {
    setUserError('')
    try {
      await deleteUser(deleteUserTarget.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id))
      setDeleteUserTarget(null)
    } catch (err) {
      setUserError(err.response?.data?.message || 'Could not delete user.')
      setDeleteUserTarget(null)
    }
  }

  if (profileLoading || !profile) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Loading settings…</p>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage clinic profile and users" />

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

          {activeTab === 'users' && admin && (
            <Card>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <UsersIcon size={18} className="text-primary-500" /> Users
                </h3>
                <Button size="sm" icon={Plus} onClick={() => setShowAddUser(true)}>
                  Add User
                </Button>
              </div>
              <p className="text-xs text-gray-400 mb-5">
                Manage the Admin and staff accounts that can sign in to this system.
              </p>

              {userError && (
                <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-4">
                  <AlertCircle size={15} className="shrink-0" />
                  {userError}
                </div>
              )}

              <Table columns={['Username', 'Role', 'Status', 'Actions']}>
                {usersLoading && (
                  <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-400">Loading users…</td></tr>
                )}
                {!usersLoading && users.length === 0 && (
                  <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-400">No users found.</td></tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-primary-50/40 transition">
                    <td className="py-3 px-3 pl-0 font-semibold text-gray-800">{u.username}</td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1.5 text-sm text-gray-600">
                        {u.role === 'ADMIN' ? <ShieldCheck size={14} className="text-primary-500" /> : <UserIcon size={14} className="text-gray-400" />}
                        {u.role === 'ADMIN' ? 'Admin' : 'Staff'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge color={u.enabled ? 'green' : 'gray'}>{u.enabled ? 'Enabled' : 'Disabled'}</Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditUserTarget(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setResetPasswordTarget(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                          title="Reset Password"
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleEnabled(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                          title={u.enabled ? 'Disable account' : 'Enable account'}
                        >
                          {u.enabled ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <button
                          onClick={() => setDeleteUserTarget(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-100 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}
        </div>
      </div>

      {/* Add User */}
      <Modal
        open={showAddUser}
        onClose={() => { setShowAddUser(false); setUserError('') }}
        title="Add User"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <FormField label="Username (Email)" required>
            <TextInput name="username" type="email" required placeholder="e.g. staff3@devsclinic.in" />
          </FormField>
          <FormField label="Password" required hint="At least 6 characters">
            <TextInput name="password" type="password" required minLength={6} placeholder="••••••••" />
          </FormField>
          <FormField label="Role" required>
            <Select name="role" required defaultValue="USER">
              <option value="USER">Staff</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </FormField>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="enabled" defaultChecked className="rounded border-gray-300 text-primary-500 focus:ring-primary-200" />
            Account enabled
          </label>
          {userError && (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              <AlertCircle size={15} className="shrink-0" /> {userError}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowAddUser(false); setUserError('') }}>Cancel</Button>
            <Button type="submit">Add User</Button>
          </div>
        </form>
      </Modal>

      {/* Edit User */}
      <Modal
        open={!!editUserTarget}
        onClose={() => { setEditUserTarget(null); setUserError('') }}
        title="Edit User"
      >
        {editUserTarget && (
          <form onSubmit={handleEditUser} className="space-y-4">
            <FormField label="Username (Email)" required>
              <TextInput name="username" type="email" required defaultValue={editUserTarget.username} />
            </FormField>
            <FormField label="Role" required>
              <Select name="role" required defaultValue={editUserTarget.role}>
                <option value="USER">Staff</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </FormField>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="enabled" defaultChecked={editUserTarget.enabled} className="rounded border-gray-300 text-primary-500 focus:ring-primary-200" />
              Account enabled
            </label>
            {userError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                <AlertCircle size={15} className="shrink-0" /> {userError}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setEditUserTarget(null); setUserError('') }}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reset Password */}
      <Modal
        open={!!resetPasswordTarget}
        onClose={() => { setResetPasswordTarget(null); setUserError('') }}
        title="Reset Password"
      >
        {resetPasswordTarget && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-gray-600">
              Set a new password for <span className="font-semibold text-gray-800">{resetPasswordTarget.username}</span>.
            </p>
            <FormField label="New Password" required hint="At least 6 characters">
              <TextInput name="newPassword" type="password" required minLength={6} placeholder="••••••••" />
            </FormField>
            <FormField label="Confirm New Password" required>
              <TextInput name="confirmPassword" type="password" required minLength={6} placeholder="••••••••" />
            </FormField>
            {userError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                <AlertCircle size={15} className="shrink-0" /> {userError}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setResetPasswordTarget(null); setUserError('') }}>Cancel</Button>
              <Button type="submit">Reset Password</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete User */}
      <Modal
        open={!!deleteUserTarget}
        onClose={() => setDeleteUserTarget(null)}
        title="Delete User"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteUserTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteUser}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold">{deleteUserTarget?.username}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
