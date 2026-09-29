async function getJSON(path) {
  const response = await fetch(path, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json()
}

export async function loadPortal() {
  const [business, services, staff] = await Promise.all([
    getJSON('/api/business'),
    getJSON('/api/services'),
    getJSON('/api/staff'),
  ])
  return { business, services: services.services, staff: staff.staff }
}
