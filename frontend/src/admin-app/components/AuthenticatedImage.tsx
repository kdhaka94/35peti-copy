import React, { useEffect, useState } from 'react'
import api from '../../utils/api'

interface AuthenticatedImageProps {
  src: string
  alt?: string
  style?: React.CSSProperties
  className?: string
}

const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({ src, alt, style, className }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    let objectUrl: string | null = null

    const fetchImage = async () => {
      try {
        setLoading(true)
        setError(false)
        const response = await api.get(src, {
          responseType: 'blob',
        })
        objectUrl = URL.createObjectURL(response.data)
        setImageSrc(objectUrl)
      } catch (err) {
        console.error('Error fetching authenticated image:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (src) {
      fetchImage()
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [src])

  if (loading) {
    return <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>Loading Image...</div>
  }

  if (error || !imageSrc) {
    return <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffebee', color: '#c62828' }}>Failed to load image</div>
  }

  return <img src={imageSrc} alt={alt} style={style} className={className} />
}

export default AuthenticatedImage
