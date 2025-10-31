import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build')

interface CollaboratorNotificationData {
  collaboratorName: string
  collaboratorEmail: string
  eventTitle: string
  eventDate: Date
  eventLocation: string
  role: string
  organizerName: string
}

export async function sendCollaboratorNotification(data: CollaboratorNotificationData) {
  const {
    collaboratorName,
    collaboratorEmail,
    eventTitle,
    eventDate,
    eventLocation,
    role,
    organizerName
  } = data

  const formattedDate = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(eventDate)

  const roleLabels = {
    ORGANIZER: 'Organizador',
    VOLUNTEER: 'Voluntario',
    TECHNICAL_SUPPORT: 'Soporte Técnico',
    MARKETING: 'Marketing'
  }

  const roleLabel = roleLabels[role as keyof typeof roleLabels] || role

  const subject = `🎃 Te han asignado como ${roleLabel} - ${eventTitle}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f97316, #dc2626); padding: 20px; border-radius: 10px;">
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ea580c; font-size: 28px; margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
            🎃 Tech-Ofrenda 💀
          </h1>
          <p style="color: #9a3412; margin: 5px 0 0 0; font-style: italic;">
            Celebrando la tecnología con tradición
          </p>
        </div>

        <div style="background: linear-gradient(135deg, #fed7aa, #fecaca); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #9a3412; margin: 0 0 15px 0; font-size: 24px;">
            ¡Has sido asignado como colaborador! 🎯
          </h2>
          <p style="color: #7c2d12; margin: 0; font-size: 16px;">
            Hola <strong>${collaboratorName}</strong>, te han asignado un rol importante en el siguiente evento:
          </p>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
          <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px;">
            📅 Detalles del Evento
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #78350f; font-weight: bold; width: 120px;">🎭 Evento:</td>
              <td style="padding: 8px 0; color: #451a03;">${eventTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f; font-weight: bold;">🕐 Fecha:</td>
              <td style="padding: 8px 0; color: #451a03;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f; font-weight: bold;">📍 Ubicación:</td>
              <td style="padding: 8px 0; color: #451a03;">${eventLocation}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f; font-weight: bold;">👑 Organizador:</td>
              <td style="padding: 8px 0; color: #451a03;">${organizerName}</td>
            </tr>
          </table>
        </div>

        <div style="background: #ddd6fe; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6; margin-bottom: 25px;">
          <h3 style="color: #5b21b6; margin: 0 0 15px 0; font-size: 20px;">
            🎯 Tu Rol
          </h3>
          <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
            <span style="background: #8b5cf6; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 16px;">
              ${roleLabel}
            </span>
          </div>
          <p style="color: #4c1d95; margin: 15px 0 0 0; font-size: 14px; text-align: center;">
            El organizador se pondrá en contacto contigo para coordinar las actividades específicas de tu rol.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #7c2d12; margin: 0 0 20px 0; font-size: 16px;">
            ¡Gracias por ser parte de nuestra comunidad tech! 🙏
          </p>
          <div style="font-size: 24px; margin: 20px 0;">
            🕯️ 💀 🌺 🎃 🕯️
          </div>
        </div>

        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; margin: 0; font-size: 12px;">
            Este es un mensaje automático de Tech-Ofrenda.<br>
            Si tienes preguntas, contacta directamente al organizador del evento.
          </p>
        </div>
      </div>
    </div>
  `

  const text = `
    ¡Has sido asignado como colaborador!

    Hola ${collaboratorName},

    Te han asignado como ${roleLabel} para el siguiente evento:

    Evento: ${eventTitle}
    Fecha: ${formattedDate}
    Ubicación: ${eventLocation}
    Organizador: ${organizerName}

    El organizador se pondrá en contacto contigo para coordinar las actividades específicas de tu rol.

    ¡Gracias por ser parte de nuestra comunidad tech!

    ---
    Tech-Ofrenda - Celebrando la tecnología con tradición
  `

  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return { success: true }
    }

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Tech-Ofrenda <noreply@tech-ofrenda.com>',
      to: collaboratorEmail,
      subject,
      html,
      text
    })
    
    console.log(`Collaborator notification sent to ${collaboratorEmail}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending collaborator notification:', error)
    return { success: false, error }
  }
}