# Documento de Requerimientos - Tech-Ofrenda

## Introducción

Tech-Ofrenda es una plataforma MVP de gestión de eventos comunitarios que combina un CMS simple para la publicación de eventos tecnológicos con un módulo de fondeo/patrocinio, utilizando la metáfora cultural del Día de Muertos. La plataforma está diseñada para ayudar a organizadores (Administradores) a planificar, fondear y ejecutar eventos tecnológicos como meetups, hackathons y conferencias.

## Glosario

- **Tech-Ofrenda**: El sistema de gestión de eventos comunitarios
- **Administrador**: Usuario organizador con permisos completos para crear y gestionar eventos
- **Líder de Comunidad**: Administrador principal de un User Group específico de una ciudad
- **User Group**: Grupo de usuarios organizados por ciudad con su propio Líder de Comunidad
- **Visitante**: Usuario público que puede ver eventos y realizar contribuciones
- **Speaker**: Ponente o presentador que participa en eventos como expositor
- **Attendee**: Participante registrado que asistirá al evento
- **Colaborador**: Persona que ayuda en la organización y ejecución del evento
- **Sponsor**: Entidad que proporciona patrocinio formal al evento
- **Evento**: Actividad tecnológica (meetup, hackathon, conferencia) publicada en la plataforma
- **Ofrenda Digital**: Contribución monetaria o en especie realizada por patrocinadores hacia un evento
- **Altar Digital**: Página de presentación del evento que muestra detalles y recibe ofrendas
- **Invitación**: Solicitud formal enviada por Administradores a Speakers para participar en eventos
- **Solicitud de Participación**: Petición enviada por Speakers para participar en un evento específico
- **Check-in**: Proceso de confirmación de asistencia el día del evento usando Ticket QR
- **Ticket QR**: Código QR único generado para cada Attendee registrado para facilitar el check-in
- **CMS**: Sistema de gestión de contenidos integrado en la plataforma

## Requerimientos

### Requerimiento 1

**Historia de Usuario:** Como Líder de Comunidad, quiero gestionar un User Group de mi ciudad y crear eventos para mi comunidad local, para organizar actividades tecnológicas específicas de mi región.

#### Criterios de Aceptación

1. THE Tech-Ofrenda SHALL permitir la creación de User Groups asociados a ciudades específicas
2. THE Tech-Ofrenda SHALL asignar un único Líder de Comunidad por User Group
3. THE Tech-Ofrenda SHALL restringir a cada Líder de Comunidad para liderar únicamente un User Group
4. THE Tech-Ofrenda SHALL permitir al Líder de Comunidad gestionar todos los aspectos de su User Group
5. THE Tech-Ofrenda SHALL mostrar eventos organizados por User Group y ciudad

### Requerimiento 2

**Historia de Usuario:** Como Líder de Comunidad, quiero crear y publicar eventos tecnológicos con información completa y funcionalidades avanzadas, para facilitar la participación y gestión de asistentes.

#### Criterios de Aceptación

1. THE Tech-Ofrenda SHALL permitir al Líder de Comunidad crear eventos con título, descripción, fecha, hora, ubicación, categoría y capacidad máxima
2. WHEN el Líder de Comunidad publique un evento, THE Tech-Ofrenda SHALL generar automáticamente un Altar Digital único para el evento
3. THE Tech-Ofrenda SHALL generar Tickets QR únicos para cada Attendee registrado al evento
4. THE Tech-Ofrenda SHALL proporcionar funcionalidad para agregar eventos al calendario de Google
5. THE Tech-Ofrenda SHALL permitir al Líder de Comunidad editar la información de eventos de su User Group

### Requerimiento 3

**Historia de Usuario:** Como Patrocinador, quiero realizar contribuciones monetarias o en especie a eventos que me interesen, para apoyar la comunidad tecnológica local.

#### Criterios de Aceptación

1. WHEN un Visitante acceda a un Altar Digital, THE Tech-Ofrenda SHALL mostrar opciones para realizar Ofrendas Digitales
2. THE Tech-Ofrenda SHALL permitir contribuciones monetarias con montos predefinidos y personalizados
3. THE Tech-Ofrenda SHALL permitir contribuciones en especie mediante descripción de productos o servicios ofrecidos
4. WHEN un Patrocinador realice una Ofrenda Digital, THE Tech-Ofrenda SHALL registrar la contribución con nombre del patrocinador y monto o descripción
5. THE Tech-Ofrenda SHALL mostrar públicamente las Ofrendas Digitales recibidas en cada Altar Digital

### Requerimiento 4

**Historia de Usuario:** Como Líder de Comunidad, quiero gestionar las contribuciones recibidas para mis eventos, para poder planificar adecuadamente los recursos disponibles para mi User Group.

#### Criterios de Aceptación

1. THE Tech-Ofrenda SHALL proporcionar un panel de administración donde el Líder de Comunidad pueda ver todas las Ofrendas Digitales recibidas para eventos de su User Group
2. WHEN se reciba una nueva Ofrenda Digital, THE Tech-Ofrenda SHALL notificar al Líder de Comunidad del evento correspondiente
3. THE Tech-Ofrenda SHALL calcular y mostrar el total de fondos recaudados por evento y por User Group
4. THE Tech-Ofrenda SHALL permitir al Líder de Comunidad marcar contribuciones en especie como confirmadas o pendientes
5. THE Tech-Ofrenda SHALL generar un resumen de recursos disponibles por evento y User Group

### Requerimiento 5

**Historia de Usuario:** Como Visitante, quiero navegar fácilmente por los eventos disponibles organizados por ciudad y sus detalles, para encontrar eventos de mi interés local y decidir si contribuir.

#### Criterios de Aceptación

1. THE Tech-Ofrenda SHALL mostrar una página principal con lista de eventos activos ordenados por fecha y agrupados por User Group/ciudad
2. THE Tech-Ofrenda SHALL permitir filtrar eventos por categoría (meetup, hackathon, conferencia) y por ciudad
3. WHEN un Visitante seleccione un evento, THE Tech-Ofrenda SHALL mostrar el Altar Digital correspondiente
4. THE Tech-Ofrenda SHALL mostrar el progreso de fondeo de cada evento de forma visual
5. THE Tech-Ofrenda SHALL incluir elementos temáticos del Día de Muertos en la interfaz de usuario

### Requerimiento 6

**Historia de Usuario:** Como Líder de Comunidad, quiero gestionar speakers para mis eventos mediante invitaciones y solicitudes, para asegurar ponentes de calidad y facilitar su participación en mi User Group.

#### Criterios de Aceptación

1. THE Tech-Ofrenda SHALL permitir al Líder de Comunidad enviar Invitaciones a Speakers específicos para participar en eventos de su User Group
2. THE Tech-Ofrenda SHALL permitir a Speakers enviar Solicitudes de Participación para eventos publicados
3. WHEN un Speaker reciba una Invitación, THE Tech-Ofrenda SHALL notificar al Speaker y permitir aceptar o rechazar
4. THE Tech-Ofrenda SHALL mostrar al Líder de Comunidad todas las Solicitudes de Participación pendientes para eventos de su User Group
5. THE Tech-Ofrenda SHALL permitir al Líder de Comunidad aprobar o rechazar Solicitudes de Participación de Speakers

### Requerimiento 7

**Historia de Usuario:** Como Attendee, quiero registrarme a eventos de mi interés y realizar check-in usando mi Ticket QR, para confirmar mi participación y facilitar el control de asistencia.

#### Criterios de Aceptación

1. THE Tech-Ofrenda SHALL permitir a Attendees registrarse a eventos disponibles proporcionando información básica
2. WHEN un Attendee se registre a un evento, THE Tech-Ofrenda SHALL generar un Ticket QR único y enviar confirmación con detalles del evento
3. THE Tech-Ofrenda SHALL proporcionar funcionalidad de Check-in mediante escaneo de Ticket QR el día del evento
4. THE Tech-Ofrenda SHALL permitir a Attendees agregar el evento a su calendario de Google desde su registro
5. THE Tech-Ofrenda SHALL mantener un registro de asistencia real versus registros para cada evento y mostrar estadísticas al Líder de Comunidad

### Requerimiento 8

**Historia de Usuario:** Como Líder de Comunidad, quiero gestionar Colaboradores y Sponsors de mis eventos, para organizar el equipo de trabajo de mi User Group y reconocer el apoyo recibido.

#### Criterios de Aceptación

1. THE Tech-Ofrenda SHALL permitir al Líder de Comunidad agregar Colaboradores a eventos de su User Group con roles específicos
2. THE Tech-Ofrenda SHALL permitir al Líder de Comunidad registrar Sponsors con diferentes niveles de patrocinio para su User Group
3. THE Tech-Ofrenda SHALL mostrar públicamente los Sponsors en cada Altar Digital con reconocimiento apropiado según su nivel
4. THE Tech-Ofrenda SHALL notificar a Colaboradores sobre sus asignaciones y responsabilidades en eventos del User Group
5. THE Tech-Ofrenda SHALL generar reportes de Colaboradores y Sponsors por evento y User Group para el Líder de Comunidad

### Requerimiento 9

**Historia de Usuario:** Como usuario del sistema, quiero autenticarme de forma segura según mi rol, para acceder a las funcionalidades correspondientes y proteger la información sensible de mi User Group.

#### Criterios de Aceptación

1. THE Tech-Ofrenda SHALL proporcionar sistema de autenticación para Líderes de Comunidad, Speakers y Attendees
2. WHEN un usuario intente acceder a funcionalidades restringidas, THE Tech-Ofrenda SHALL requerir credenciales válidas
3. THE Tech-Ofrenda SHALL mantener sesiones seguras para usuarios autenticados según su rol y User Group
4. THE Tech-Ofrenda SHALL aplicar permisos específicos basados en el rol del usuario y su asociación a User Groups
5. THE Tech-Ofrenda SHALL proporcionar funcionalidad de registro para nuevos Líderes de Comunidad, Speakers y Attendees