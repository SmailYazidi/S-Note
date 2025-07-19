import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProviders } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SNote App",
  description: "A simple note and password manager.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
