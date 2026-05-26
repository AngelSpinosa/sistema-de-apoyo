import SidebarAdmin from '@/components/layout/sidebar-admin'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 ml-14 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}