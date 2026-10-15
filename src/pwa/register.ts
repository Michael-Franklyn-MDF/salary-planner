import { registerSW } from 'virtual:pwa-register'

const updateEvent = 'salary-planner:update-available'

export function registerAppServiceWorker(): () => Promise<void> {
  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new Event(updateEvent))
    },
  })

  return update
}

export function updateAvailableEventName(): string {
  return updateEvent
}

export async function removeLegacyCaches(): Promise<void> {
  if (!('caches' in window)) return

  const names = await window.caches.keys()
  await Promise.all(
    names
      .filter((name) => name.startsWith('salary-planner-v'))
      .map((name) => window.caches.delete(name)),
  )
}
