import type { Metadata } from 'next'
import './globals.css'

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
      </head>
      <body>{children}</body>
    </html>
  )
}
