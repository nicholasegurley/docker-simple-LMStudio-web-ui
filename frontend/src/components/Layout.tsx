import { ReactNode } from 'react'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
  isDark: boolean
  onToggleTheme: () => void
}

export default function Layout({ children, isDark, onToggleTheme }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header isDark={isDark} onToggleTheme={onToggleTheme} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}


