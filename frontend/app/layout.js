import './styles/globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Todo Application',
  description: 'A full-featured todo application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}