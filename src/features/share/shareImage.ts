export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled'

interface ShareNavigator {
  canShare?: (data: ShareData) => boolean
  share?: (data: ShareData) => Promise<void>
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

interface Options {
  title: string
  text: string
  nav?: ShareNavigator
  download?: (blob: Blob, filename: string) => void
}

/**
 * Web Share API with the image attached; falls back to a download when the browser can't share
 * files (most desktop browsers) or the share sheet fails. Closing the sheet is not an error.
 * Call this straight from a click handler: browsers require a fresh user gesture to share.
 */
export async function shareOrDownload(
  blob: Blob,
  filename: string,
  { title, text, nav = typeof navigator === 'undefined' ? {} : navigator, download = downloadBlob }: Options,
): Promise<ShareOutcome> {
  const file = new File([blob], filename, { type: blob.type || 'image/png' })
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title, text })
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled'
      // Any other failure (NotAllowedError after a slow render, etc.): don't leave them empty-handed.
    }
  }
  download(blob, filename)
  return 'downloaded'
}
