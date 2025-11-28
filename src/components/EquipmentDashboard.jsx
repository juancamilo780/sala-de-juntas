import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import React, { useMemo } from 'react';
import { useCalendar } from '../calendar/useCalendar.js';

/**
 * Dashboard para el área de sistemas.
 * Muestra solo las reuniones que requieren algún equipo.
 */
export function EquipmentDashboard({ events, activeRoom }) {
  const { upsert } = useCalendar();

  // Filtramos SOLO las reuniones con equipos y ordenamos por fecha
  const items = useMemo(() => {
    const now = new Date();
    return events
      .filter((ev) => ev.equipment && ev.equipment.length > 0)
      .filter((ev) => new Date(ev.end) >= new Date(now.setHours(0, 0, 0, 0)))
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [events]);

  // Calculamos los contadores por estado
  const { total, pending, inProgress, done } = useMemo(() => {
    const acc = { total: 0, pending: 0, inProgress: 0, done: 0 };
    items.forEach((ev) => {
      acc.total += 1;
      const status = ev.supportStatus || 'pending';
      if (status === 'pending') acc.pending += 1;
      else if (status === 'in_progress') acc.inProgress += 1;
      else if (status === 'done') acc.done += 1;
    });
    return acc;
  }, [items]);

  const formatDate = (date) => format(new Date(date), 'EEE dd/MM/yyyy', { locale: es });

  const formatTimeRange = (start, end) =>
    `${format(new Date(start), 'HH:mm', { locale: es })} – ${format(new Date(end), 'HH:mm', { locale: es })}`;

  const roomLabel = (calendar) => {
    if (calendar === 'S2') return 'Sala 2° piso';
    if (calendar === 'S3') return 'Sala 3° piso';
    if (calendar === 'VERDE') return 'Sala Verde';
    return calendar || '-';
  };

  const handleStatusChange = (ev, status) => {
    upsert(
      {
        ...ev,
        supportStatus: status,
      },
      ev.calendar || activeRoom
    );
  };

  return (
    <div className='equip-dashboard'>
      <div className='equip-header'>
        <div>
          <h2>Dashboard de equipos</h2>
          <p className='equip-subtitle'>
            Reuniones que requieren videobeam, portátil o pendón. Solo visible en modo admin.
          </p>
        </div>
        <div className='equip-summary'>
          <span>
            Total: <strong>{total}</strong>
          </span>
          <span className='dot dot-pending' /> Pendiente ({pending})
          <span className='dot dot-progress' /> En proceso ({inProgress})
          <span className='dot dot-done' /> Atendido ({done})
        </div>
      </div>

      {items.length === 0 ? (
        <div className='equip-empty'>No hay reuniones con equipos pendientes para las fechas seleccionadas.</div>
      ) : (
        <div className='equip-table-wrapper'>
          <table className='equip-table'>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Sala</th>
                <th>Solicitante</th>
                <th>Teléfono</th>
                <th>Título / Motivo</th>
                <th>Equipos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((ev) => (
                <tr key={ev.id}>
                  <td>{formatDate(ev.start)}</td>
                  <td>{formatTimeRange(ev.start, ev.end)}</td>
                  <td>{roomLabel(ev.calendar)}</td>
                  <td>{ev.clientName || '-'}</td>
                  <td>{ev.phone || '-'}</td>
                  <td>{ev.title || ev.reason || '-'}</td>
                  <td>{(ev.equipment || []).join(', ')}</td>
                  <td>
                    <select
                      value={ev.supportStatus || 'pending'}
                      onChange={(e) => handleStatusChange(ev, e.target.value)}
                    >
                      <option value='pending'>Pendiente</option>
                      <option value='in_progress'>En proceso</option>
                      <option value='done'>Atendido</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
