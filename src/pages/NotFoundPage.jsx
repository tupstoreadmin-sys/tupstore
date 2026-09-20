import { useNavigate } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { Container } from '../components/layout'
import { EmptyState, Button } from '../components/ui'

// Catch-all route (App.jsx's `path="*"`). Same EmptyState-in-a-Container
// pattern already used by ProductDetailPage's "Product not found" state —
// no new visual pattern introduced.

export default function NotFoundPage() {
  const navigate = useNavigate()

  useSEO({
    title: 'Page Not Found | Tupperware Exclusive Store',
    description: 'The page you are looking for could not be found.',
  })

  return (
    <Container className="py-12 md:py-20">
      <EmptyState
        icon="🔍"
        title="Page Not Found"
        description="The page you're looking for doesn't exist or may have been moved."
        action={
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        }
      />
    </Container>
  )
}
