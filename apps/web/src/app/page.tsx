
import { Navigate } from '@tanstack/react-router'

const RedirectToVideos = () => {
  return <Navigate to="/videos" replace />
}

export default RedirectToVideos