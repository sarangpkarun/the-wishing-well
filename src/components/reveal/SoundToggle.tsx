interface Props {
  enabled: boolean
  onChange: (on: boolean) => void
}

export function SoundToggle({ enabled, onChange }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="btn-ghost !px-3 !py-1.5 text-sm"
      title={enabled ? 'Mute the angelic choir' : 'Unmute the angelic choir'}
    >
      <span aria-hidden>{enabled ? '🔊' : '🔇'}</span>
      Choir: {enabled ? 'on' : 'off'}
    </button>
  )
}
