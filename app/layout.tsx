import type { Metadata } from 'next'
import '../src/index.css'
import 'non.geist'

export const metadata: Metadata = {
  title: 'React Video Editor',
  description: 'A powerful video editor built with React and Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
} 