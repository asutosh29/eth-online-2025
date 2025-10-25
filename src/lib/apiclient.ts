// src/lib/apiClient.ts
export async function getSwitchStatus(address: string) {
  const res = await fetch(`/api/switch/status?address=${encodeURIComponent(address)}`)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}
