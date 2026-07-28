import { useState } from 'react'
import { Building2, Image, Palette, Users as UsersIcon, Save, Plus, MoreVertical } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import Badge from '../components/common/Badge.jsx'
import { FormField, TextInput, TextArea } from '../components/common/FormField.jsx'
import { clinicProfile, clinicUsers } from '../data/mockData.js'

const themeColors = [
  { name: 'Violet (Default)', value: '#8B5CF6' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Sky', value: '#0EA5E9' },
]

const tabs = [
  { key: 'profile', label: 'Clinic Profile', icon: Building2 },
  { key: 'theme', label: 'Theme', icon: Palette },
  { key: 'users', label: 'Users', icon: UsersIcon },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [selectedColor, setSelectedColor] = useState(themeColors[0].value)

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage clinic profile, appearance, and staff access" />

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
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Building2 size={18} className="text-primary-500" /> Clinic Profile
              </h3>
              <p className="text-xs text-gray-400 mb-5">Basic information shown on invoices and reports</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary-500 text-white flex items-center justify-center font-bold text-xl shrink-0">
                  {clinicProfile.logoInitials}
                </div>
                <div>
                  <Button size="sm" variant="secondary" icon={Image}>Upload Logo</Button>
                  <p className="text-xs text-gray-400 mt-1.5">PNG or JPG, recommended 256x256px</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Clinic Name"><TextInput defaultValue={clinicProfile.name} /></FormField>
                <FormField label="Tagline"><TextInput defaultValue={clinicProfile.tagline} /></FormField>
                <FormField label="Phone"><TextInput defaultValue={clinicProfile.phone} /></FormField>
                <FormField label="Email"><TextInput defaultValue={clinicProfile.email} /></FormField>
                <FormField label="GSTIN"><TextInput defaultValue={clinicProfile.gstin} /></FormField>
                <FormField label="Address" className="sm:col-span-2">
                  <TextArea defaultValue={clinicProfile.address} />
                </FormField>
              </div>

              <div className="flex justify-end mt-5">
                <Button icon={Save}>Save Changes</Button>
              </div>
            </Card>
          )}

          {activeTab === 'theme' && (
            <Card>
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Palette size={18} className="text-primary-500" /> Theme
              </h3>
              <p className="text-xs text-gray-400 mb-5">Choose an accent color for your clinic dashboard</p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {themeColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedColor(c.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition ${
                      selectedColor === c.value ? 'border-primary-500' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <span className="w-9 h-9 rounded-full" style={{ backgroundColor: c.value }} />
                    <span className="text-xs font-medium text-gray-600 text-center">{c.name}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-primary-50/50 text-xs text-gray-500">
                Theme changes are visual preferences only in this demo build and are not persisted.
              </div>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <UsersIcon size={18} className="text-primary-500" /> Users & Access
                </h3>
                <Button size="sm" icon={Plus}>Add User</Button>
              </div>
              <p className="text-xs text-gray-400 mb-5">Manage staff accounts and roles</p>

              <div className="space-y-2">
                {clinicUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-500 hidden sm:block">{u.role}</span>
                      <Badge color={u.status === 'Active' ? 'green' : 'gray'}>{u.status}</Badge>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                        <MoreVertical size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
