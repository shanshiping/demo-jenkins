import type { Metadata } from 'next'
import { Syne, Space_Mono, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'Demo App',
  description: 'Spring Boot + Next.js Full Stack Demo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={`${syne.variable} ${dmSans.variable} ${spaceMono.variable}`}>
      <body className="font-sans bg-surface text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
