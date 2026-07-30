export default function Card({ children, className = '', padded = true }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-soft border border-primary-100/60 ${
        padded ? 'p-5' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
