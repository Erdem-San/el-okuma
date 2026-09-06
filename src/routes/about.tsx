import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutComponent,
})

function AboutComponent() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 space-y-4 shadow-lg">
        <h1 className="text-3xl font-bold text-white tracking-tight">elokuma Hakkında</h1>
        <p className="text-slate-300 leading-relaxed">
          Bu proje, modern web ve mobil uyumlu ön yüz mimarilerini temel alarak TanStack ailesinin en güçlü araçlarıyla ve Tailwind CSS v4 ile sıfırdan kurgulanmıştır.
        </p>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Kurulum Özellikleri:</h2>
          <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
            <li><strong className="text-white">React 19:</strong> En güncel React sürümü ve bileşen mimarisi</li>
            <li><strong className="text-white">TanStack Router:</strong> Güçlü tip güvenliği ve otomatik rota oluşturma</li>
            <li><strong className="text-white">TanStack Query:</strong> Sunucu verisi önbellekleme ve yönetimi</li>
            <li><strong className="text-white">Tailwind CSS v4:</strong> <code>@tailwindcss/vite</code> ile optimize modern tasarım sistemi</li>
            <li><strong className="text-white">TypeScript:</strong> Katı tip kontrolü ve geliştirici deneyimi</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
