import App from '../../src/app-component'

export default function IdPage({ params }: { params: { id: string } }) {
  return <App id={params.id} />
} 