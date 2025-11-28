# Salas de Juntas – Front-only

Aplicativo web para **gestionar reservas de salas de juntas** dentro de la empresa.

- Permite reservar **3 salas**: Sala 2° piso, Sala 3° piso y Sala Verde.
- Muestra las reservas en un calendario (mes, semana, día, agenda).
- Formulario con datos del solicitante, motivo, equipos requeridos y notas.
- **Modo estándar** (solo lectura) y **modo admin** (crea/edita/elimina).
- **Dashboard de equipos** para el área de sistemas (solo admin).
- Por ahora es 100% **front-only**: los datos se guardan en el navegador (`localStorage`)  
  y está listo para que un backend se conecte más adelante.

---

## 1. Tecnologías

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [react-big-calendar](https://github.com/jquense/react-big-calendar)
- [date-fns](https://date-fns.org/)
- [Zustand](https://github.com/pmndrs/zustand) (estado global + persistencia en localStorage)

---

## 2. Requisitos

- Node.js 18+
- npm (incluido con Node)

Verificar:

```bash
node -v
npm -v
3. Instalación y ejecución
Clonar o copiar el proyecto.

Abrir la carpeta del proyecto en la terminal.

Instalar dependencias:

bash
Copiar código
npm install
Iniciar el servidor:

bash
Copiar código
npm run dev
Abrir en el navegador:

text
Copiar código
http://localhost:5173
Los mensajes en amarillo de Vite son solo warnings, mientras no haya errores rojos, todo ok.

4. Modelo de datos (evento de calendario)
Toda la app trabaja con un mismo tipo de objeto evento:

ts
Copiar código
{
  id: string
  calendar: 'S2' | 'S3' | 'VERDE' // sala
  start: string | Date            // inicio
  end: string | Date              // fin
  clientName: string              // nombre solicitante
  phone?: string
  reason: 'reunion' | 'presentacion' | 'otro'
  assignedBy?: string             // quién registró
  title?: string                  // título visible
  notes?: string
  equipment?: string[]            // ['videobeam','laptop','banner']
  ownerId: string                 // dueño de la reserva (front-only)
  supportStatus?: 'pending' | 'in_progress' | 'done' // soporte sistemas
  supportNotes?: string
}
En esta versión, estos datos se guardan en localStorage, pero están listos para mapearse 1:1 a un backend.

5. Uso básico del calendario
5.1. Salas
El sistema maneja 3 salas:

Sala 2° piso (S2)

Sala 3° piso (S3)

Sala Verde (VERDE)

Las pestañas superiores cambian la sala visible.
Cada sala tiene su propio set de reservas.

5.2. Navegación
En la parte superior del calendario:

Today, Back, Next para moverse en el tiempo.

Month, Week, Day, Agenda para cambiar la vista.

La última vista usada se guarda automáticamente.

5.3. Crear una reserva
Opción A – Botón “+ Crear”

Clic en + Crear (abajo a la derecha).

Se abre el formulario con:

Inicio: ahora

Fin: ahora + 30 minutos

Completar y guardar.

Opción B – Seleccionando en el calendario

En vista Week / Day, clic en una franja horaria (o arrastrar).

El modal se abre con:

Inicio: selección hecha.

Fin: inicio + 30 minutos.

Siempre que cambies el inicio, si el fin no existe o es menor/igual, el sistema ajusta automáticamente el fin a inicio + 30 minutos.

5.4. Campos del formulario
Inicio (datetime-local)

Fin (datetime-local)

Nombre del solicitante

Teléfono

Motivo (reunión, presentación, otro)

Quién registró

Título (opcional)

Equipos requeridos:

Videobeam

PC portátil

Pendón

Notas (texto libre)

Botones:

Guardar → crea/actualiza reserva.

Cerrar → cierra sin guardar.

Eliminar → solo en edición y modo admin.

5.5. Ver / editar / eliminar
Los eventos se muestran como tarjetas dentro del calendario.

Doble clic sobre un evento:

En modo estándar → muestra aviso “Solo un admin puede editar esta reserva”.

En modo admin → abre el modal de edición.

Eliminar solo es posible en modo admin.

6. Modos de uso (rol)
6.1. Modo estándar
Pensado para usuarios “normales”:

Pueden crear reservas.

Pueden ver todas las reservas.

No pueden editar ni eliminar reservas existentes.

6.2. Modo admin
Pensado para el área de sistemas / admins:

Puede crear, editar y eliminar reservas.

Tiene acceso al Dashboard de equipos.

6.3. Cambiar de modo
En la esquina inferior izquierda hay un botón discreto con un engranaje ⚙︎:

Gris claro → modo estándar.

Azul → modo admin.

Al hacer clic:

Cambia el modo.

Muestra un mensaje:

“Has activado el modo admin”

“Has vuelto a modo estándar”

Nota: El rol admin se guarda en localStorage (admin-mode).
En producción, esto debería controlarse desde un backend con autenticación real.

7. Dashboard de equipos (solo admin)
Además del calendario, el admin tiene un panel para sistemas.

7.1. Acceso
Estar en modo admin (⚙︎ azul).

En la parte superior derecha aparece un toggle:

text
Copiar código
[ Calendario ]  [ Dashboard de equipos ]
Al hacer clic en Dashboard de equipos, se oculta el calendario y aparece el panel.

7.2. Qué muestra
El dashboard lista solo las reuniones que tienen equipos:

Columnas:

Fecha

Hora (rango)

Sala

Solicitante

Teléfono

Título / Motivo

Equipos (ej. “videobeam, laptop”)

Estado (select)

Por defecto se muestran:

Reuniones a partir de hoy (no muestra históricas).

Ordenadas por fecha/hora de inicio.

7.3. Estado de soporte
Cada fila tiene un select con 3 estados:

Pendiente → soporte aún no atendido.

En proceso → sistema preparando / montando equipos.

Atendido → soporte completado.

Al cambiar el estado:

Se actualiza el evento en el store.

Automáticamente se actualiza el resumen de arriba:

text
Copiar código
Total: X   •   Pendiente (a)   •   En proceso (b)   •   Atendido (c)
Esto sirve como mini tablero de carga de trabajo para sistemas.

8. Persistencia de datos (front-only)
Actualmente las reservas se guardan en localStorage con la clave:

rooms-calendar-store

Esto implica:

Cada navegador tiene sus propios datos.

Si se limpia el storage o se cambia de equipo, se pierden.

El código está preparado para reemplazar esa capa por un backend real.

9. Guía rápida para integrar backend
La lógica principal está en:

src/calendar/useCalendar.js → store global (events, upsert, remove).

src/pages/CalendarPage.jsx → reglas de negocio (validaciones de solapamiento, etc.).

src/components/EquipmentDashboard.jsx → dashboard de equipos.

9.1. Puntos de integración sugeridos
GET /api/meetings?room=S2

POST /api/meetings

PUT /api/meetings/:id

DELETE /api/meetings/:id

Los métodos del store:

upsert(data, calendarKey) → mapea a POST/PUT.

remove(id) → mapea a DELETE.

El desarrollador de backend puede:

Reemplazar la lógica interna de upsert y remove por fetch a la API.

Mantener la forma del objeto de evento (ver sección 4).

Dejar los componentes prácticamente igual; el front no se entera del cambio.

10. Estructura de archivos relevante
src/

calendar/useCalendar.js → estado global (Zustand) + definición de evento.

pages/CalendarPage.jsx → pantalla principal.

components/Modal.jsx → formulario de reserva.

components/CalendarEvent.jsx → tarjeta dentro del calendario.

components/EquipmentDashboard.jsx → dashboard de equipos (admin).

ui/toastStore.js → sistema de notificaciones.

styles.css → estilos generales.
```
