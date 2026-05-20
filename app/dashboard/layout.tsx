import Sidebar from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      {/* El ml-14 empuja el contenido para que no quede tapado por el sidebar cerrado */}
      <main className="flex-1 ml-14 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}