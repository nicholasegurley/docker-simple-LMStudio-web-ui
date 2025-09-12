import { ReactNode } from 'react'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
  isDark: boolean
  onToggleTheme: () => void
  showSidebar?: boolean
  sidebarContent?: ReactNode
}

export default function Layout({ children, isDark, onToggleTheme, showSidebar, sidebarContent }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header isDark={isDark} onToggleTheme={onToggleTheme} />
      <div className="flex h-[calc(100vh-4rem)]">
        {showSidebar && sidebarContent && (
          <div className="flex-shrink-0">
            {sidebarContent}
          </div>
        )}
        <main className={`flex-1 ${showSidebar ? 'flex flex-col min-h-0' : 'container mx-auto px-4 py-8'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}


