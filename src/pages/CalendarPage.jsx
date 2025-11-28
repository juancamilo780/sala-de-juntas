import { format, getDay, parse, startOfWeek } from 'date-fns';
import es from 'date-fns/locale/es';
import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { useAuthLite, useCalendar } from '../calendar/useCalendar.js';
import { CalendarEvent } from '../components/CalendarEvent.jsx';
import { EquipmentDashboard } from '../components/EquipmentDashboard.jsx';
import { Modal } from '../components/Modal.jsx';
import { Navbar } from '../components/Navbar.jsx';
import { Toast } from '../components/Toast.jsx';
import { useToastStore } from '../ui/toastStore.js';

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

// Claves de salas
const ROOM_KEYS = { S2: 'S2', S3: 'S3', VERDE: 'VERDE' };

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export function CalendarPage() {
  const { events, activeEvent, setActive, clearActive, upsert, remove } = useCalendar();
  const { admin, toggleAdmin } = useAuthLite();
  const { show } = useToastStore();

  const [lastView, setLastView] = useState(
    typeof window !== 'undefined' ? window.localStorage.getItem('lastView') || 'week' : 'week'
  );
  const [activeCal, setActiveCal] = useState(
    typeof window !== 'undefined' ? window.localStorage.getItem('activeCal') || ROOM_KEYS.S2 : ROOM_KEYS.S2
  );
  const [open, setOpen] = useState(false);
  const [slotRange, setSlotRange] = useState(() => {
    const now = new Date();
    const later = new Date(now.getTime() + 30 * 60 * 1000);
    return { start: now, end: later };
  });

  // Modo de vista para admin
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'equipment'

  const safeEvents = useMemo(
    () =>
      events
        .filter((e) => (e.calendar || ROOM_KEYS.S2) === activeCal)
        .map((e) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        })),
    [events, activeCal]
  );

  const eventStyleGetter = () => {
    const backgroundColor = admin ? '#D1FAE5' : '#FFE4E6';
    return {
      style: {
        backgroundColor,
        borderRadius: '10px',
        border: 'none',
        color: '#111827',
        display: 'block',
        padding: '2px 4px',
        fontSize: '11px',
      },
    };
  };

  const canManageEvent = () => admin;

  const onDoubleClickEvent = (event) => {
    // Siempre abrimos el modal con la info
    setActive(event);
    setSlotRange({ start: new Date(event.start), end: new Date(event.end) });
    setOpen(true);

    if (!canManageEvent()) {
      // Modo estándar: solo lectura
      show('Visualización de la reserva (solo lectura)', 'info');
    }
  };

  const onSelectSlot = ({ start, end }) => {
    clearActive();
    setSlotRange({ start, end });
    setOpen(true);
  };

  const onViewChanged = (view) => {
    setLastView(view);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lastView', view);
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    clearActive();
  };

  const handleSave = (data) => {
    const s = new Date(data.start);
    const e = new Date(data.end);

    if (!(s instanceof Date) || isNaN(s)) {
      show('Fecha de inicio inválida', 'error');
      return;
    }
    if (!(e instanceof Date) || isNaN(e)) {
      show('Fecha de fin inválida', 'error');
      return;
    }
    if (e <= s) {
      show('La hora de fin debe ser mayor a la de inicio', 'error');
      return;
    }

    const hasConflict = events
      .filter((ev) => (ev.calendar || ROOM_KEYS.S2) === activeCal)
      .filter((ev) => !activeEvent || ev.id !== activeEvent.id)
      .some((ev) => overlaps(s, e, new Date(ev.start), new Date(ev.end)));

    if (hasConflict) {
      show('Ya existe una reserva en este horario para esta sala', 'error');
      return;
    }

    const payload = {
      ...(activeEvent || {}),
      ...data,
      start: s,
      end: e,
      calendar: activeCal,
    };

    upsert(payload, activeCal);
    show('Reserva guardada correctamente', 'success');
    setOpen(false);
  };

  const handleDelete = () => {
    if (!activeEvent) return;

    if (!canManageEvent()) {
      show('Solo un admin puede eliminar esta reserva', 'error');
      return;
    }

    remove(activeEvent.id);
    show('Reserva eliminada', 'success');
    setOpen(false);
  };

  return (
    <div className='page'>
      <Navbar />
      <div className='page-inner'>
        <div className='top-row'>
          <div className='tabbar'>
            <button
              className={`tab ${activeCal === ROOM_KEYS.S2 ? 'active' : ''}`}
              onClick={() => {
                setActiveCal(ROOM_KEYS.S2);
                window.localStorage.setItem('activeCal', ROOM_KEYS.S2);
              }}
            >
              Sala 2° piso
            </button>
            <button
              className={`tab ${activeCal === ROOM_KEYS.S3 ? 'active' : ''}`}
              onClick={() => {
                setActiveCal(ROOM_KEYS.S3);
                window.localStorage.setItem('activeCal', ROOM_KEYS.S3);
              }}
            >
              Sala 3° piso
            </button>
            <button
              className={`tab ${activeCal === ROOM_KEYS.VERDE ? 'active' : ''}`}
              onClick={() => {
                setActiveCal(ROOM_KEYS.VERDE);
                window.localStorage.setItem('activeCal', ROOM_KEYS.VERDE);
              }}
            >
              Sala Verde
            </button>
          </div>

          {admin && (
            <div className='view-toggle'>
              <button
                type='button'
                className={`view-pill ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                Calendario
              </button>
              <button
                type='button'
                className={`view-pill ${viewMode === 'equipment' ? 'active' : ''}`}
                onClick={() => setViewMode('equipment')}
              >
                Dashboard de equipos
              </button>
            </div>
          )}
        </div>

        {viewMode === 'calendar' && (
          <div className='calendar-wrapper'>
            <Calendar
              culture='es'
              localizer={localizer}
              events={safeEvents}
              startAccessor='start'
              endAccessor='end'
              style={{ height: 'calc(100vh - 190px)' }}
              selectable
              popup
              onSelectSlot={onSelectSlot}
              onDoubleClickEvent={onDoubleClickEvent}
              onView={onViewChanged}
              view={lastView}
              defaultView='week'
              components={{ event: CalendarEvent }}
              eventPropGetter={eventStyleGetter}
            />
          </div>
        )}

        {admin && viewMode === 'equipment' && <EquipmentDashboard events={events} activeRoom={activeCal} />}

        {viewMode === 'calendar' && (
          <button
            type='button'
            className='fab'
            onClick={() => {
              clearActive();
              const now = new Date();
              const later = new Date(now.getTime() + 30 * 60 * 1000);
              setSlotRange({ start: now, end: later });
              setOpen(true);
            }}
          >
            + Crear
          </button>
        )}

        <Modal
          open={open}
          onClose={handleCloseModal}
          onSave={handleSave}
          onDelete={admin && activeEvent ? handleDelete : null}
          initialStart={slotRange.start}
          initialEnd={slotRange.end}
          activeEvent={activeEvent}
          // Admin puede editar todo.
          // Usuario estándar solo puede editar cuando está creando (no hay activeEvent).
          canEdit={admin || !activeEvent}
        />

        <button
          type='button'
          className={`role-toggle ${admin ? 'role-toggle-admin' : ''}`}
          onClick={() => {
            const next = !admin;
            toggleAdmin();
            if (!next) setViewMode('calendar');
            show(next ? 'Has activado el modo admin' : 'Has vuelto a modo estándar', 'info');
          }}
          title={admin ? 'Modo admin' : 'Modo estándar'}
        >
          ⚙︎
        </button>

        <Toast />
      </div>
    </div>
  );
}
