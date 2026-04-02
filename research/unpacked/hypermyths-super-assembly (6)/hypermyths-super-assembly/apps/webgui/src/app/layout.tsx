import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'HyperMyths Super Assembly',
  description: 'Private superbrain operator shell',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
