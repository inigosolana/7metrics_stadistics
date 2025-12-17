"use client"

export const CourtVisualization = ({ events }: { events: any[] }) => {
  return (
    <div className="bg-gradient-to-b from-green-600 to-green-700 rounded-xl p-4 shadow-lg aspect-video flex items-center justify-center">
      <div className="text-center">
        <div className="text-white/60 text-sm mb-2">VISUALIZACIÓN DE CANCHA</div>
        <div className="text-6xl text-white/20">⚽</div>
        <div className="text-white/40 text-xs mt-2">{events.length} eventos registrados</div>
      </div>
    </div>
  )
}
