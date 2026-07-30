import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import Button from '../components/common/Button.jsx'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mb-6">
          <SearchX size={36} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">404</h1>
        <p className="text-gray-500 mt-2">
          This page doesn't exist. It may have been moved or the link may be broken.
        </p>
        <Link to="/dashboard">
          <Button className="mt-6">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
