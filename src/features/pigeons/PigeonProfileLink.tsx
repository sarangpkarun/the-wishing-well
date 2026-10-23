import { Link } from 'react-router-dom'

/** Link to the pigeon profile: grouped by name when the wisher gave one, otherwise just this wish. */
export function PigeonProfileLink({ wishId, wisherName }: { wishId: string; wisherName: string | null }) {
  const to = wisherName ? `/pigeons/wisher/${encodeURIComponent(wisherName)}` : `/pigeons/wish/${wishId}`
  return (
    <Link to={to} className="btn-ghost w-full text-sm">
      🐦 {wisherName ? `${wisherName}'s pigeon loft` : 'Pigeon profile'}
    </Link>
  )
}
