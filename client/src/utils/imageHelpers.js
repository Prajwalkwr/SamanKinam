export const normalizeImageArray = (image) => {
  if (!image) return []
  if (Array.isArray(image)) return image.filter(Boolean)
  if (typeof image === 'string') return [image]
  return []
}

export const getFirstImage = (image) => {
  const normalized = normalizeImageArray(image)
  return normalized[0] || null
}
