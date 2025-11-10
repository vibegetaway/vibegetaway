import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Best Trip',
  description: 'Find your next adventure',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="site-verification"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var script = document.createElement("script");
                script.async = 1;
                script.src = 'https://emrldtp.com/NDcyNDU3.js?t=472457';
                document.head.appendChild(script);
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

