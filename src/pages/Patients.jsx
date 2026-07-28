import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2, UserPlus, Filter } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Pagination from '../components/common/Pagination.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import { Select } from '../components/common/FormField.jsx'
import { patients as mockPatients } from '../data/mockData.js'

const PAGE_SIZE = 6

export default function Patients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState(mockPatients)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.id.toLowerCase().includes(query.toLowerCase()) ||
        p.phone.includes(query)
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [patients, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilterChange(v) {
    setStatusFilter(v)
    setPage(1)
  }

  function handleQueryChange(v) {
    setQuery(v)
    setPage(1)
  }

  function confirmDelete() {
    setPatients((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${filtered.length} patient${filtered.length !== 1 ? 's' : ''} found`}
        actions={
          <Button icon={UserPlus} onClick={() => navigate('/patients/register')}>
            Register Patient
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchInput
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by name, ID or phone..."
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <Select value={statusFilter} onChange={(e) => handleFilterChange(e.target.value)} className="w-40">
              <option>All</option>
              <option>New</option>
              <option>Active</option>
              <option>Follow-up</option>
              <option>Inactive</option>
            </Select>
          </div>
        </div>

        <Table columns={['Patient', 'Age/Gender', 'Contact', 'Concern', 'Last Visit', 'Status', 'Actions']}>
          {pageItems.length === 0 && (
            <tr>
              <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                No patients match your search.
              </td>
            </tr>
          )}
          {pageItems.map((p) => (
            <tr key={p.id} className="hover:bg-primary-50/40 transition">
              <td className="py-3 px-3 pl-0">
                <p className="font-semibold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-400">{p.id}</p>
              </td>
              <td className="py-3 px-3 text-gray-600">{p.age} / {p.gender}</td>
              <td className="py-3 px-3 text-gray-600">{p.phone}</td>
              <td className="py-3 px-3 text-gray-600">{p.concern}</td>
              <td className="py-3 px-3 text-gray-600">{p.lastVisit}</td>
              <td className="py-3 px-3"><Badge>{p.status}</Badge></td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                    title="View"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => navigate(`/patients/${p.id}?edit=1`)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
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

        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />
      </Card>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Patient"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
