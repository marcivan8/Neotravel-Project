import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/context/AuthContext'

export const metadata: Metadata = {
  title: 'NeoTravel — Transport autocar de groupe',
  description: 'Obtenez votre devis transport autocar instantané. Associations, écoles, entreprises, collectivités — NeoTravel organise votre voyage de groupe depuis 2010.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/brand/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/brand/png/favicon-32.png" />
        <link rel="apple-touch-icon" href="/brand/png/apple-touch-icon.png" />
        <link rel="manifest" href="/brand/site.webmanifest" />
        <meta name="theme-color" content="#2e3a1f" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
