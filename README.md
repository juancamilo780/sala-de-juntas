# Salas de Juntas – Front-only

Aplicativo web para **gestionar reservas de salas de juntas** dentro de la empresa.

- Permite reservar **3 salas**: Sala 2° piso, Sala 3° piso y Sala Verde.
- Muestra las reservas en un calendario (mes, semana, día, agenda).
- Formulario sencillo con datos del solicitante, motivo, equipos requeridos y notas.
- **Modo estándar** (solo lectura) y **modo admin** (crea/edita/elimina).
- Por ahora es 100% **front-only**: los datos se guardan en el navegador (localStorage)  
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

Puedes verificar con:

```bash
node -v
npm -v
3. Instalación y ejecución
Clonar o copiar el proyecto en tu equipo.

Abrir la carpeta del proyecto en una terminal.

Instalar dependencias:

bash
Copiar código
npm install
Iniciar el servidor de desarrollo:

bash
Copiar código
npm run dev
Abrir el navegador en:

text
Copiar código
http://localhost:5173
Nota: si ves un mensaje amarillo en consola sobre Vite, es solo un aviso, no un error.

4. Conceptos básicos del sistema
4.1. Salas
El sistema maneja 3 salas:

Sala 2° piso (S2)

Sala 3° piso (S3)

Sala Verde (VERDE)

Cada pestaña en la parte superior corresponde a una sala distinta.
Las reservas de una sala no se mezclan con las de las otras.

4.2. Reserva
Cada reserva contiene:

Sala (calendar): S2, S3 o VERDE.

Inicio (start): fecha y hora de inicio.

Fin (end): fecha y hora de finalización.

Nombre del solicitante (clientName).

Teléfono (phone) – opcional.

Motivo (reason): reunión, presentación u otro.

Quién registró (assignedBy) – opcional.

Título (title) – opcional.

Notas (notes) – opcional.

Equipos requeridos (equipment): videobeam, PC portátil, pendón.

Owner de la reserva (ownerId) – se usa a nivel interno.

En el código esta estructura está documentada en:

text
Copiar código
src/calendar/useCalendar.js
5. Cómo usar el calendario
5.1. Cambiar de sala
En la parte superior, debajo del título, verás 3 botones:

Sala 2° piso

Sala 3° piso

Sala Verde

Haz clic en cada uno para cambiar la sala que estás viendo.
El sistema recuerda la última sala en localStorage.

5.2. Navegar por fechas
En la parte superior del calendario puedes:

Moverte entre semanas/meses (Back / Next / Today).

Cambiar la vista:

Month (Mes)

Week (Semana)

Day (Día)

Agenda

La última vista usada se guarda y se vuelve a cargar automáticamente.

5.3. Crear una nueva reserva
Hay dos formas:

a) Botón “+ Crear”
En la esquina inferior derecha haz clic en “+ Crear”.

Se abrirá el formulario con:

Inicio: ahora

Fin: ahora + 30 minutos

Completa los campos y pulsa Guardar.

b) Seleccionar un rango en el calendario
En la vista Week o Day, haz clic y arrastra sobre la franja de tiempo deseada,
o haz un clic en una hora específica.

Se abrirá el formulario con:

Inicio: la hora seleccionada.

Fin: la hora seleccionada + 30 minutos (si el fin no existía o es menor que inicio).

🔁 Siempre que cambies la hora de inicio en el formulario,
si la hora de fin está vacía o es anterior/igual, el sistema la ajusta automáticamente a +30 min.

5.4. Campos del formulario
En el modal Nueva reserva / Editar reserva encontrarás:

Inicio: fecha/hora de inicio.

Fin: fecha/hora de fin (se ajusta automáticamente +30 min cuando cambias el inicio).

Nombre del solicitante: quién va a usar la sala.

Teléfono: contacto del solicitante.

Motivo: reunión, presentación u otro.

Quién registró: persona que realiza la reserva (ej. Paola).

Título (opcional): texto corto que aparece en el calendario.

Equipos requeridos:

Videobeam

PC portátil

Pendón para proyectar

Notas: detalles adicionales (proveedor, tema, etc.).

Botones:

Guardar: crea o actualiza la reserva.

Cerrar: cierra el formulario sin guardar.

Eliminar: (solo en edición y en modo admin) borra la reserva.

5.5. Ver detalles de una reserva
Las reservas aparecen como tarjetas en el calendario.

Cada tarjeta muestra:

Título o nombre del solicitante.

Nombre del solicitante.

Teléfono.

Equipos requeridos.

Si estás en modo estándar, verás una etiqueta “Solo lectura”.

5.6. Editar o eliminar (solo admin)
Para editar, haz doble clic sobre una reserva.

Para eliminar, dentro del modal pulsa el botón Eliminar.

⚠️ Esto solo funciona si estás en modo admin.
En modo estándar, el doble clic muestra un mensaje indicando que solo un admin puede editar.

6. Modos de uso: estándar vs admin
El sistema tiene dos modos:

🧍 Modo estándar

Puede crear reservas.

Puede ver todas las reservas.

No puede editar ni eliminar reservas.

👑 Modo admin

Puede crear, editar y eliminar cualquier reserva de cualquier sala.

6.1. ¿Cómo se cambia el modo?
En la esquina inferior izquierda hay un pequeño icono de engranaje ⚙︎:

Gris y semitransparente → modo estándar.

Azul → modo admin.

Al hacer clic:

Cambia el modo.

Aparece un mensaje en la parte inferior:

“Has activado el modo admin”

“Has vuelto a modo estándar”

Nota: actualmente el “modo admin” se guarda en el navegador con localStorage.
En un backend real, esto se debería validar con usuarios y roles.

7. Dónde se guardan los datos (versión front-only)
Por ahora, todas las reservas se guardan en:

localStorage del navegador, con la clave:
rooms-calendar-store

Esto significa:

Cada navegador/PC tiene sus propias reservas.

Si se borra la caché o se cambia de equipo, se pierde la información.

Por eso el código está preparado para que más adelante un backend guarde todo en BD.

8. Guía rápida para conectar un backend (para desarrolladores)
En src/calendar/useCalendar.js están centralizadas las operaciones:

upsert(data, calendarKey) → crear/actualizar reserva.

remove(id) → eliminar reserva.

events → lista actual.

activeEvent → reserva seleccionada.

Sugerencia de endpoints REST:

GET /api/meetings?room=S2

POST /api/meetings

PUT /api/meetings/:id

DELETE /api/meetings/:id

Y la forma del objeto que viaja por API debería ser:

json
Copiar código
{
  "id": "string",
  "calendar": "S2",
  "start": "2025-11-27T09:00:00.000Z",
  "end": "2025-11-27T09:30:00.000Z",
  "clientName": "Juan Pérez",
  "phone": "3001234567",
  "reason": "reunion",
  "assignedBy": "Paola",
  "title": "Reunión importante",
  "notes": "Detalles adicionales...",
  "equipment": ["videobeam", "laptop"],
  "ownerId": "usuario-123"
}
En el código ya hay comentarios // 🔁 En backend real: ... indicando los puntos exactos donde se debería llamar a la API.

9. Notas finales
Este proyecto está pensado para ser simple de usar por los colaboradores y simple de extender por el equipo de sistemas.

Toda la lógica de negocio está concentrada en:

src/pages/CalendarPage.jsx (comportamiento del calendario).

src/calendar/useCalendar.js (estado y modelo de datos).

La parte visual (formularios, estilos, tarjetas) está en:

src/components/Modal.jsx

src/components/CalendarEvent.jsx

src/styles.css

Si tienes dudas o quieres agregar nuevas salas, campos o reglas de negocio,
el flujo ideal es modificarlos primero en el front y luego reflejarlos en el backend.
```
