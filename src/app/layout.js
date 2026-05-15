import './globals.css'

export const metadata = {
  title: 'Catálogo Web WhatsApp',
  description: 'Tu catálogo de productos en línea rápido y ligero',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
