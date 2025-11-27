import React, { useState, useEffect } from 'react'

const EQUIPMENT_OPTIONS = [
  { value: 'videobeam', label: 'Videobeam' },
  { value: 'laptop', label: 'PC portátil' },
  { value: 'banner', label: 'Pendón para proyectar' },
]

/**
 * Modal de creación/edición de reservas.
 * Recibe el rango inicial (start/end) y un evento activo opcional.
 * onSave/onDelete son callbacks que viven en CalendarPage (donde luego se conectará el backend).
 */
export function Modal({
  open,
  onClose,
  onSave,
  onDelete,
  initialStart,
  initialEnd,
  activeEvent,
}) {
  const [formValues, setFormValues] = useState({
    start: initialStart,
    end: initialEnd,
    clientName: activeEvent?.clientName || '',
    phone: activeEvent?.phone || '',
    reason: activeEvent?.reason || 'reunion',
    assignedBy: activeEvent?.assignedBy || '',
    title: activeEvent?.title || '',
    notes: activeEvent?.notes || '',
    equipment: activeEvent?.equipment || [],
  })

  useEffect(() => {
    setFormValues({
      start: initialStart,
      end: initialEnd,
      clientName: activeEvent?.clientName || '',
      phone: activeEvent?.phone || '',
      reason: activeEvent?.reason || 'reunion',
      assignedBy: activeEvent?.assignedBy || '',
      title: activeEvent?.title || '',
      notes: activeEvent?.notes || '',
      equipment: activeEvent?.equipment || [],
    })
  }, [initialStart, initialEnd, activeEvent])

  if (!open) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleEquipmentChange = (value, checked) => {
    setFormValues((prev) => {
      const current = prev.equipment || []
      let next
      if (checked) {
        next = current.includes(value) ? current : [...current, value]
      } else {
        next = current.filter((v) => v !== value)
      }
      return { ...prev, equipment: next }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formValues)
  }

  const toLocalInputValue = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const pad = (n) => String(n).padStart(2, '0')
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes())
    )
  }

  const handleStartChange = (e) => {
    const value = e.target.value
    const newStart = new Date(value)
    if (isNaN(newStart.getTime())) return

    setFormValues((prev) => {
      let nextEnd = prev.end ? new Date(prev.end) : null

      // Si no hay fin aún, o el fin es menor/igual al inicio,
      // ajustamos automáticamente a +30 minutos.
      if (!nextEnd || nextEnd <= newStart) {
        nextEnd = new Date(newStart.getTime() + 30 * 60 * 1000)
      }

      return {
        ...prev,
        start: newStart,
        end: nextEnd,
      }
    })
  }

  const handleEndChange = (e) => {
    const value = e.target.value
    const newEnd = new Date(value)
    if (isNaN(newEnd.getTime())) return

    setFormValues((prev) => ({
      ...prev,
      end: newEnd,
    }))
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="modal-title">
          {activeEvent ? 'Editar reserva' : 'Nueva reserva'}
        </h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="grid-2">
            <div className="field-group">
              <label className="field-label">Inicio</label>
              <input
                type="datetime-local"
                name="start"
                value={toLocalInputValue(formValues.start)}
                onChange={handleStartChange}
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label">Fin</label>
              <input
                type="datetime-local"
                name="end"
                value={toLocalInputValue(formValues.end)}
                onChange={handleEndChange}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field-group">
              <label className="field-label">Nombre del solicitante</label>
              <input
                type="text"
                name="clientName"
                placeholder="Ej. Juan Pérez"
                value={formValues.clientName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label">Teléfono</label>
              <input
                type="tel"
                name="phone"
                placeholder="300 123 4567"
                value={formValues.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field-group">
              <label className="field-label">Motivo</label>
              <select
                name="reason"
                value={formValues.reason}
                onChange={handleChange}
              >
                <option value="reunion">Reunión</option>
                <option value="presentacion">Presentación</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Quién registró</label>
              <input
                type="text"
                name="assignedBy"
                placeholder="Ej. Paola"
                value={formValues.assignedBy}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Título (opcional)</label>
            <input
              type="text"
              name="title"
              placeholder="Ej. Reunión con proveedor"
              value={formValues.title}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Equipos requeridos</label>
            <p className="field-help">
              Selecciona todos los que necesitas para esta reunión.
            </p>
            <div className="equipment-options">
              {EQUIPMENT_OPTIONS.map((opt) => (
                <label key={opt.value} className="checkbox-inline">
                  <input
                    type="checkbox"
                    checked={formValues.equipment?.includes(opt.value)}
                    onChange={(e) =>
                      handleEquipmentChange(opt.value, e.target.checked)
                    }
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Notas</label>
            <textarea
              name="notes"
              placeholder="Detalles adicionales..."
              value={formValues.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="modal-footer">
            {activeEvent && onDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={onDelete}
              >
                Eliminar
              </button>
            )}

            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cerrar
            </button>

            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}