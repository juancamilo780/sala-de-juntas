import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Identificador de sesión muy simple basado en localStorage.
 * En backend real, esto se reemplazaría con el id de usuario autenticado.
 */
const SESSION_KEY = 'session-id';
const ADMIN_KEY = 'admin-mode';

function ensureSessionId() {
  if (typeof window === 'undefined') return 'anonymous';
  let sid = window.localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/**
 * Auth super ligero para front-only.
 * El backend real debería validar roles/permiso de admin.
 */
export const useAuthLite = create((set, get) => ({
  sessionId: ensureSessionId(),
  admin: typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_KEY) === 'true' : false,
  toggleAdmin() {
    set((state) => {
      const next = !state.admin;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ADMIN_KEY, String(next));
      }
      return { admin: next };
    });
  },
}));

/**
 * Forma del evento que se usa en toda la app (front y futuro backend):
 *
 * {
 *   id: string,
 *   calendar: 'S2' | 'S3' | 'VERDE',   // sala
 *   start: string | Date,
 *   end: string | Date,
 *   clientName: string,
 *   phone?: string,
 *   reason: 'reunion' | 'presentacion' | 'otro',
 *   assignedBy?: string,
 *   title?: string,
 *   notes?: string,
 *   equipment?: string[],
 *   ownerId: string,
 *   supportStatus?: 'pending' | 'in_progress' | 'done',
 *   supportNotes?: string,
 * }
 */
export const useCalendar = create(
  persist(
    (set, get) => ({
      events: [],
      activeEvent: null,

      setActive(event) {
        set({ activeEvent: event });
      },

      clearActive() {
        set({ activeEvent: null });
      },

      upsert(data, calendarKey) {
        const { events } = get();
        const sessionId = useAuthLite.getState().sessionId;

        // Siempre garantizamos un estado de soporte
        const baseSupport = {
          supportStatus: data.supportStatus || 'pending',
          supportNotes: data.supportNotes || '',
        };

        // EDITAR
        if (data.id) {
          const updated = events.map((ev) =>
            ev.id === data.id
              ? {
                  ...ev,
                  ...data,
                  ...baseSupport,
                  calendar: calendarKey,
                }
              : ev
          );
          set({ events: updated, activeEvent: null });
          return;
        }

        // CREAR
        const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        const next = [
          ...events,
          {
            ...data,
            ...baseSupport,
            id,
            calendar: calendarKey,
            ownerId: data.ownerId || sessionId,
          },
        ];
        set({ events: next, activeEvent: null });
      },

      remove(id) {
        const { events } = get();
        set({
          events: events.filter((ev) => ev.id !== id),
          activeEvent: null,
        });
      },
    }),
    {
      name: 'rooms-calendar-store',
    }
  )
);
