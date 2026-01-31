export const metadata = {
  title: 'Agentic CLI API',
  description: 'REST API for agentic CLI integration with VS Code',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
