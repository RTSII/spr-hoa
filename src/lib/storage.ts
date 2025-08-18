import { supabase } from '@/lib/supabase'

// Extract the path relative to the 'photos' bucket from a stored value (path or public URL)
export function extractPhotoPath(input?: string | null): string | null {
  if (!input) return null
  try {
    // If it's already a relative path like 'gallery/abc.jpg'
    if (!input.startsWith('http')) {
      // Strip accidental leading 'photos/' if present
      return input.replace(/^photos\//, '')
    }

    // If it's a public URL from Supabase like
    // https://<project>.supabase.co/storage/v1/object/public/photos/<path>
    const photosIndex = input.indexOf('/photos/')
    if (photosIndex !== -1) {
      return input.substring(photosIndex + '/photos/'.length)
    }
  } catch (_) {
    // ignore
  }
  return null
}

export async function getSignedPhotoUrl(input?: string | null, expiresInSeconds = 3600): Promise<string | null> {
  const path = extractPhotoPath(input)
  if (!path) return null

  const { data, error } = await supabase.storage.from('photos').createSignedUrl(path, expiresInSeconds)
  if (error) {
    console.warn('Failed creating signed URL for path', path, error)
    return null
  }
  return data?.signedUrl ?? null
}
