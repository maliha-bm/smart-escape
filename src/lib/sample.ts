/** Bundled demo dataset served from /public. Fetched locally — no remote backend involved. */
export const SAMPLE_URL = `${import.meta.env.BASE_URL}building.json`

export async function fetchSampleText(): Promise<string> {
  const response = await fetch(SAMPLE_URL)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.text()
}
