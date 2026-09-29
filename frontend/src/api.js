const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function getJSON(path) {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json()
}
