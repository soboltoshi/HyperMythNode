import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HyperMyths Computation Market',
  description: 'Local-first super assembly control surface',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
