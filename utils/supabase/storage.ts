export async function uploadFileToBucket(bucket: string, file: File) {
  // send file to server-side upload endpoint which uses the service role
  const form = new FormData()
  form.append('file', file)
  form.append('bucket', bucket)

  const res = await fetch('/api/uploads', { method: 'POST', body: form })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error || `Upload failed with status ${res.status}`)
  }

  const body = await res.json()
  return body?.publicUrl ?? null
}

export default uploadFileToBucket
