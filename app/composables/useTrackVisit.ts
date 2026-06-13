import { usePublicUtm } from './usePublicUtm'

export function useTrackVisit(username: string) {
  onMounted(() => {
    if (!import.meta.client) return

    const utm = usePublicUtm()
    const referrer = document.referrer?.slice(0, 500) || undefined

    const payload = JSON.stringify({
      referrer,
      ...utm,
    })

    // sendBeacon tidak blok navigasi
    const sent = navigator.sendBeacon(
      `/api/public/${username}/visit`,
      new Blob([payload], { type: 'application/json' }),
    )

    // Fallback jika sendBeacon tidak tersedia / gagal
    if (!sent) {
      fetch(`/api/public/${username}/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silent — tracking tidak boleh merusak UX
      })
    }
  })
}
