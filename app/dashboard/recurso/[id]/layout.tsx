// app/dashboard/recurso/[id]/layout.tsx
// Sobreescribe el layout del dashboard para que el visor ocupe toda la pantalla

export default function RecursoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  )
}