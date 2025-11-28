import React, { useEffect, useState } from 'react';

const EQUIPMENT_OPTIONS = [
  { value: 'videobeam', label: 'Videobeam' },
  { value: 'laptop', label: 'PC portátil' },
  { value: 'banner', label: 'Pendón para proyectar' },
];

export function Modal({ open, onClose, onSave, onDelete, initialStart, initialEnd, activeEvent, canEdit = true }) {
  if (!open) return null;

  const isEditing = !!activeEvent;
  const [form, setForm] = useState({
    start: initialStart || new Date(),
    end: initialEnd || new Date(Date.now() + 30 * 60 * 1000),
    clientName: '',
    phone: '',
    reason: 'reunion',
    assignedBy: '',
    title: '',
    notes: '',
    equipment: [],
  });

  // Solo lectura cuando NO es admin y estamos viendo un evento existente
  const readOnly = !canEdit && isEditing;

  useEffect(() => {
    if (activeEvent) {
      setForm({
        start: new Date(activeEvent.start),
        end: new Date(activeEvent.end),
        clientName: activeEvent.clientName || '',
        phone: activeEvent.phone || '',
        reason: activeEvent.reason || 'reunion',
        assignedBy: activeEvent.assignedBy || '',
        title: activeEvent.title || '',
        notes: activeEvent.notes || '',
        equipment: activeEvent.equipment || [],
      });
    } else {
      const start = initialStart || new Date();
      const end = initialEnd || new Date((initialStart || new Date()).getTime() + 30 * 60 * 1000);
      setForm((prev) => ({
        ...prev,
        start,
        end,
      }));
    }
  }, [activeEvent, initialStart, initialEnd]);

  const handleChange = (field, value) => {
    if (readOnly) return;

    setForm((prev) => {
      // lógica de +30 min cuando se cambia inicio
      if (field === 'start') {
        const start = new Date(value);
        let end = prev.end ? new Date(prev.end) : null;

        if (!end || end <= start) {
          end = new Date(start.getTime() + 30 * 60 * 1000);
        }

        return { ...prev, start, end };
      }

      if (field === 'end') {
        const end = new Date(value);
        return { ...prev, end };
      }

      return { ...prev, [field]: value };
    });
  };

  const handleToggleEquipment = (value) => {
    if (readOnly) return;

    setForm((prev) => {
      const exists = prev.equipment.includes(value);
      return {
        ...prev,
        equipment: exists ? prev.equipment.filter((e) => e !== value) : [...prev.equipment, value],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) {
      onClose();
      return;
    }
    onSave(form);
  };

  const toInputValue = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  return (
    <div className='modal-backdrop' onClick={onClose}>
      <div className='modal' onClick={(e) => e.stopPropagation()}>
        <div className='top-row' style={{ marginBottom: 12 }}>
          <h2 className='modal-title'>{isEditing ? 'Detalle de la reserva' : 'Nueva reserva'}</h2>
          {readOnly && (
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#F3F4F6',
                color: '#6B7280',
              }}
            >
              Solo lectura
            </span>
          )}
        </div>

        <form className='modal-form' onSubmit={handleSubmit}>
          <div className='grid-2'>
            <div className='field-group'>
              <label className='field-label'>Inicio</label>
              <input
                type='datetime-local'
                value={toInputValue(form.start)}
                onChange={(e) => handleChange('start', e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className='field-group'>
              <label className='field-label'>Fin</label>
              <input
                type='datetime-local'
                value={toInputValue(form.end)}
                onChange={(e) => handleChange('end', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>

          <div className='grid-2'>
            <div className='field-group'>
              <label className='field-label'>Nombre del solicitante</label>
              <input
                type='text'
                value={form.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                placeholder='Ej. Juan Pérez'
                disabled={readOnly}
              />
            </div>
            <div className='field-group'>
              <label className='field-label'>Teléfono</label>
              <input
                type='tel'
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder='300 123 4567'
                disabled={readOnly}
              />
            </div>
          </div>

          <div className='grid-2'>
            <div className='field-group'>
              <label className='field-label'>Motivo</label>
              <select value={form.reason} onChange={(e) => handleChange('reason', e.target.value)} disabled={readOnly}>
                <option value='reunion'>Reunión</option>
                <option value='presentacion'>Presentación</option>
                <option value='otro'>Otro</option>
              </select>
            </div>
            <div className='field-group'>
              <label className='field-label'>Quién registró</label>
              <input
                type='text'
                value={form.assignedBy}
                onChange={(e) => handleChange('assignedBy', e.target.value)}
                placeholder='Ej. Paola'
                disabled={readOnly}
              />
            </div>
          </div>

          <div className='field-group'>
            <label className='field-label'>Título (opcional)</label>
            <input
              type='text'
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder='Ej. Reunión con proveedor'
              disabled={readOnly}
            />
          </div>

          <div className='field-group'>
            <label className='field-label'>Equipos requeridos</label>
            <div className='equipment-options'>
              {EQUIPMENT_OPTIONS.map((opt) => (
                <label key={opt.value} className='checkbox-inline'>
                  <input
                    type='checkbox'
                    checked={form.equipment.includes(opt.value)}
                    onChange={() => handleToggleEquipment(opt.value)}
                    disabled={readOnly}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className='field-group'>
            <label className='field-label'>Notas</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder='Detalles adicionales...'
              disabled={readOnly}
            />
          </div>

          <div className='modal-footer'>
            <button type='button' className='btn btn-ghost' onClick={onClose}>
              Cerrar
            </button>

            {isEditing && canEdit && onDelete && (
              <button type='button' className='btn btn-danger' onClick={onDelete}>
                Eliminar
              </button>
            )}

            {canEdit && (
              <button type='submit' className='btn btn-primary'>
                Guardar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
