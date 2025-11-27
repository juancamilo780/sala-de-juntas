import React from 'react'
import { useAuthLite } from '../calendar/useCalendar.js'

/**
 * Tarjeta que se muestra dentro del calendario por cada reserva.
 * No tiene lógica, solo visual.
 */
export function CalendarEvent({ event }) {
  const { admin } = useAuthLite()
  const isEditable = admin

  return (
    <div className="event-card">
      <div className="event-main">
        <strong>{event.title || event.clientName || 'Reserva'}</strong>
      </div>
      {event.clientName && (
        <div className="event-line">
          Solicitante: {event.clientName}
        </div>
      )}
      {event.phone && (
        <div className="event-line">
          Teléfono: {event.phone}
        </div>
      )}
      {event.equipment && event.equipment.length > 0 && (
        <div className="event-line event-equipment">
          Equipos: {event.equipment.join(', ')}
        </div>
      )}
      {!isEditable && (
        <div className="event-badge">
          Solo lectura
        </div>
      )}
    </div>
  )
}