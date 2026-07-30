export function FormField({ label, required, children, hint, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-primary-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const baseInput =
  'w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition placeholder:text-gray-400'

export function TextInput({ className = '', ...props }) {
  return <input className={`${baseInput} ${className}`} {...props} />
}

export function TextArea({ className = '', ...props }) {
  return <textarea className={`${baseInput} resize-none ${className}`} rows={3} {...props} />
}

export function Select({ children, className = '', ...props }) {
  return (
    <select className={`${baseInput} cursor-pointer ${className}`} {...props}>
      {children}
    </select>
  )
}
