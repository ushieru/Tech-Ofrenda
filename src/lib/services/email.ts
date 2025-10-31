import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build')

export interface AttendeeConfirmationEmailData {
  attendeeName: string
  attendeeEmail: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  eventDescription: string
  qrDataUrl: string
  calendarUrl?: string
}

export interface SpeakerInvitationEmailData {
  speakerName: string
  speakerEmail: string
  eventTitle: string
  eventDate: string
  userGroupName: string
  city: string
  topic: string
  invitationId: string
}

export interface SpeakerApplicationNotificationEmailData {
  leaderName: string
  leaderEmail: string
  applicantName: string
  eventTitle: string
  topic: string
  bio: string
  applicationId: string
}

export interface SpeakerApprovalEmailData {
  speakerName: string
  speakerEmail: string
  eventTitle: string
  eventDate: string
  userGroupName: string
  city: string
  topic: string
}

export interface SpeakerRejectionEmailData {
  speakerName: string
  speakerEmail: string
  eventTitle: string
  userGroupName: string
}

export interface SpeakerAcceptanceNotificationEmailData {
  leaderName: string
  leaderEmail: string
  speakerName: string
  eventTitle: string
  topic: string
}

export interface SpeakerDeclineNotificationEmailData {
  leaderName: string
  leaderEmail: string
  speakerName: string
  eventTitle: string
}

/**
 * Sends a confirmation email to an attendee with their QR ticket
 */
export async function sendAttendeeConfirmationEmail(data: AttendeeConfirmationEmailData): Promise<void> {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return
    }
    const {
      attendeeName,
      attendeeEmail,
      eventTitle,
      eventDate,
      eventLocation,
      eventDescription,
      qrDataUrl,
      calendarUrl
    } = data

    const formattedDate = new Date(eventDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const calendarSection = calendarUrl 
      ? `<p style="margin: 20px 0;">
           <a href="${calendarUrl}" 
              style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
             📅 Agregar a Google Calendar
           </a>
         </p>`
      : ''

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmación de Registro - ${eventTitle}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎃 Tech-Ofrenda</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">¡Tu registro ha sido confirmado!</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #ff6b35; margin-top: 0;">¡Hola ${attendeeName}!</h2>
            
            <p>Te confirmamos tu registro para el evento:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">${eventTitle}</h3>
              <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
              <p><strong>📍 Ubicación:</strong> ${eventLocation}</p>
              <div style="margin-top: 15px;">
                <strong>📝 Descripción:</strong>
                <div style="margin-top: 10px; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #ff6b35;">
                  ${eventDescription}
                </div>
              </div>
            </div>

            ${calendarSection}
            
            <div style="text-align: center; margin: 30px 0;">
              <h3 style="color: #ff6b35;">🎫 Tu Ticket QR</h3>
              <p>Presenta este código QR el día del evento para hacer check-in:</p>
              <div style="background: white; padding: 20px; border-radius: 10px; display: inline-block; border: 2px solid #ff6b35;">
                <img src="${qrDataUrl}" alt="QR Code" style="display: block; margin: 0 auto;" />
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 15px;">
                💡 Guarda este email o toma una captura de pantalla del QR
              </p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">📋 Instrucciones importantes:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Llega 15 minutos antes del evento</li>
                <li>Presenta tu QR code en la entrada</li>
                <li>Trae una identificación válida</li>
                <li>Si tienes problemas, contacta a los organizadores</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                ¿Tienes preguntas? Responde a este email y te ayudaremos.
              </p>
              <p style="color: #ff6b35; font-weight: bold;">
                ¡Nos vemos en el evento! 🚀
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const textContent = `
¡Hola ${attendeeName}!

Te confirmamos tu registro para el evento:

${eventTitle}
📅 Fecha: ${formattedDate}
📍 Ubicación: ${eventLocation}

📝 Descripción:
${eventDescription}

🎫 Tu código QR está adjunto en este email. Preséntalo el día del evento para hacer check-in.

📋 Instrucciones importantes:
- Llega 15 minutos antes del evento
- Presenta tu QR code en la entrada
- Trae una identificación válida
- Si tienes problemas, contacta a los organizadores

${calendarUrl ? `📅 Agregar a Google Calendar: ${calendarUrl}` : ''}

¿Tienes preguntas? Responde a este email y te ayudaremos.

¡Nos vemos en el evento! 🚀

Tech-Ofrenda
    `

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Tech-Ofrenda <noreply@tech-ofrenda.com>',
      to: attendeeEmail,
      subject: `🎫 Confirmación de registro - ${eventTitle}`,
      html: htmlContent,
      text: textContent
    })

    console.log(`Confirmation email sent to ${attendeeEmail} for event ${eventTitle}`)
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    throw new Error('Failed to send confirmation email')
  }
}
/**
 * Se
nds an invitation email to a speaker
 */
export async function sendSpeakerInvitationEmail(data: SpeakerInvitationEmailData): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return
    }

    const {
      speakerName,
      speakerEmail,
      eventTitle,
      eventDate,
      userGroupName,
      city,
      topic,
      invitationId
    } = data

    const formattedDate = new Date(eventDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const acceptUrl = `${process.env.NEXTAUTH_URL}/speakers/invitation/${invitationId}?action=accept`
    const declineUrl = `${process.env.NEXTAUTH_URL}/speakers/invitation/${invitationId}?action=decline`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invitación como Speaker - ${eventTitle}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎃 Tech-Ofrenda</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">¡Te invitamos a ser Speaker!</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #ff6b35; margin-top: 0;">¡Hola ${speakerName}!</h2>
            
            <p>Te invitamos cordialmente a participar como speaker en nuestro evento:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">${eventTitle}</h3>
              <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
              <p><strong>🏢 Organizador:</strong> ${userGroupName} - ${city}</p>
              <p><strong>🎯 Tema propuesto:</strong> ${topic}</p>
            </div>
            
            <div style="background: #e8f5e8; border: 1px solid #4CAF50; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #2e7d32; margin-top: 0;">🎤 ¿Por qué te invitamos?</h4>
              <p style="color: #2e7d32; margin: 0;">
                Creemos que tu experiencia y conocimientos serían una gran contribución para nuestra comunidad tecnológica. 
                Tu participación ayudará a enriquecer el evento y compartir conocimiento valioso con los asistentes.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <h3 style="color: #ff6b35;">¿Aceptas la invitación?</h3>
              <div style="margin: 20px 0;">
                <a href="${acceptUrl}" 
                   style="display: inline-block; background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;">
                  ✅ Aceptar Invitación
                </a>
                <a href="${declineUrl}" 
                   style="display: inline-block; background-color: #f44336; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;">
                  ❌ Declinar
                </a>
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">📋 Próximos pasos:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Haz clic en "Aceptar" si puedes participar</li>
                <li>Podrás editar tu tema y biografía después de aceptar</li>
                <li>Te contactaremos con más detalles del evento</li>
                <li>Si tienes dudas, responde a este email</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                ¿Tienes preguntas? Responde a este email y te ayudaremos.
              </p>
              <p style="color: #ff6b35; font-weight: bold;">
                ¡Esperamos contar contigo! 🚀
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Tech-Ofrenda <noreply@tech-ofrenda.com>',
      to: speakerEmail,
      subject: `🎤 Invitación como Speaker - ${eventTitle}`,
      html: htmlContent
    })

    console.log(`Speaker invitation sent to ${speakerEmail} for event ${eventTitle}`)
  } catch (error) {
    console.error('Error sending speaker invitation email:', error)
    throw new Error('Failed to send speaker invitation email')
  }
}

/**
 * Sends notification to community leader about speaker application
 */
export async function sendSpeakerApplicationNotificationEmail(data: SpeakerApplicationNotificationEmailData): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return
    }

    const {
      leaderName,
      leaderEmail,
      applicantName,
      eventTitle,
      topic,
      bio,
      applicationId
    } = data

    const reviewUrl = `${process.env.NEXTAUTH_URL}/dashboard/speakers/applications/${applicationId}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nueva Solicitud de Speaker - ${eventTitle}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎃 Tech-Ofrenda</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Nueva solicitud de Speaker</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #ff6b35; margin-top: 0;">¡Hola ${leaderName}!</h2>
            
            <p>Has recibido una nueva solicitud para participar como speaker en tu evento:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">${eventTitle}</h3>
              <p><strong>👤 Solicitante:</strong> ${applicantName}</p>
              <p><strong>🎯 Tema propuesto:</strong> ${topic}</p>
            </div>
            
            <div style="background: #e3f2fd; border: 1px solid #2196F3; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin-top: 0;">📝 Biografía del solicitante:</h4>
              <p style="color: #1976d2; margin: 0; font-style: italic;">
                "${bio}"
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reviewUrl}" 
                 style="display: inline-block; background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                📋 Revisar Solicitud
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">⏰ Acción requerida:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Revisa la solicitud en tu dashboard</li>
                <li>Evalúa si el tema es apropiado para tu evento</li>
                <li>Aprueba o rechaza la solicitud</li>
                <li>El solicitante será notificado de tu decisión</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Puedes gestionar todas las solicitudes desde tu dashboard de líder de comunidad.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Tech-Ofrenda <noreply@tech-ofrenda.com>',
      to: leaderEmail,
      subject: `🔔 Nueva solicitud de Speaker - ${eventTitle}`,
      html: htmlContent
    })

    console.log(`Speaker application notification sent to ${leaderEmail}`)
  } catch (error) {
    console.error('Error sending speaker application notification email:', error)
    throw new Error('Failed to send speaker application notification email')
  }
}

/**
 * Sends approval email to speaker
 */
export async function sendSpeakerApprovalEmail(data: SpeakerApprovalEmailData): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return
    }

    const {
      speakerName,
      speakerEmail,
      eventTitle,
      eventDate,
      userGroupName,
      city,
      topic
    } = data

    const formattedDate = new Date(eventDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>¡Solicitud Aprobada! - ${eventTitle}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 ¡Felicidades!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Tu solicitud ha sido aprobada</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #4CAF50; margin-top: 0;">¡Hola ${speakerName}!</h2>
            
            <p>¡Excelentes noticias! Tu solicitud para participar como speaker ha sido <strong>aprobada</strong>:</p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3 style="color: #333; margin-top: 0;">${eventTitle}</h3>
              <p><strong>📅 Fecha:</strong> ${formattedDate}</p>
              <p><strong>🏢 Organizador:</strong> ${userGroupName} - ${city}</p>
              <p><strong>🎯 Tu tema:</strong> ${topic}</p>
            </div>
            
            <div style="background: #e3f2fd; border: 1px solid #2196F3; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin-top: 0;">📋 Próximos pasos:</h4>
              <ul style="color: #1976d2; margin: 0; padding-left: 20px;">
                <li>Los organizadores se pondrán en contacto contigo pronto</li>
                <li>Recibirás más detalles sobre el formato y duración de tu presentación</li>
                <li>Podrás coordinar los aspectos técnicos necesarios</li>
                <li>Te enviaremos recordatorios antes del evento</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; display: inline-block;">
                <h4 style="color: #856404; margin-top: 0;">🎤 ¡Prepárate para brillar!</h4>
                <p style="color: #856404; margin: 0;">
                  Estamos emocionados de tenerte como parte de nuestro evento. 
                  Tu conocimiento y experiencia serán muy valiosos para la comunidad.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                ¿Tienes preguntas? Responde a este email y te ayudaremos.
              </p>
              <p style="color: #4CAF50; font-weight: bold;">
                ¡Nos vemos en el evento! 🚀
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Tech-Ofrenda <noreply@tech-ofrenda.com>',
      to: speakerEmail,
      subject: `🎉 ¡Solicitud aprobada! - ${eventTitle}`,
      html: htmlContent
    })

    console.log(`Speaker approval email sent to ${speakerEmail}`)
  } catch (error) {
    console.error('Error sending speaker approval email:', error)
    throw new Error('Failed to send speaker approval email')
  }
}

/**
 * Sends rejection email to speaker
 */
export async function sendSpeakerRejectionEmail(data: SpeakerRejectionEmailData): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return
    }

    const {
      speakerName,
      speakerEmail,
      eventTitle,
      userGroupName
    } = data

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Actualización sobre tu solicitud - ${eventTitle}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎃 Tech-Ofrenda</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Actualización sobre tu solicitud</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #ff6b35; margin-top: 0;">Hola ${speakerName},</h2>
            
            <p>Gracias por tu interés en participar como speaker en <strong>${eventTitle}</strong> organizado por ${userGroupName}.</p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #856404; margin: 0;">
                Después de revisar cuidadosamente tu solicitud, lamentamos informarte que en esta ocasión no podremos incluirte en el programa del evento. 
                Esta decisión se debe a limitaciones de tiempo y la gran cantidad de solicitudes recibidas.
              </p>
            </div>
            
            <div style="background: #e8f5e8; border: 1px solid #4CAF50; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #2e7d32; margin-top: 0;">🌟 No te desanimes</h4>
              <ul style="color: #2e7d32; margin: 0; padding-left: 20px;">
                <li>Valoramos mucho tu interés en compartir conocimiento</li>
                <li>Te animamos a participar como asistente en el evento</li>
                <li>Mantente atento a futuros eventos donde podrías participar</li>
                <li>Considera aplicar temprano para próximas convocatorias</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666;">
                La comunidad tecnológica siempre necesita personas como tú que quieren compartir su experiencia y conocimiento.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                ¿Tienes preguntas? Responde a este email y te ayudaremos.
              </p>
              <p style="color: #ff6b35; font-weight: bold;">
                ¡Esperamos verte en futuros eventos! 🚀
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Tech-Ofrenda <noreply@tech-ofrenda.com>',
      to: speakerEmail,
      subject: `Actualización sobre tu solicitud - ${eventTitle}`,
      html: htmlContent
    })

    console.log(`Speaker rejection email sent to ${speakerEmail}`)
  } catch (error) {
    console.error('Error sending speaker rejection email:', error)
    throw new Error('Failed to send speaker rejection email')
  }
}

/**
 * Sends notification to community leader when speaker accepts invitation
 */
export async function sendSpeakerAcceptanceNotificationEmail(data: SpeakerAcceptanceNotificationEmailData): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return
    }

    const {
      leaderName,
      leaderEmail,
      speakerName,
      eventTitle,
      topic
    } = data

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>¡Speaker confirmado! - ${eventTitle}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 ¡Excelente!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Speaker confirmado</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #4CAF50; margin-top: 0;">¡Hola ${leaderName}!</h2>
            
            <p>¡Buenas noticias! <strong>${speakerName}</strong> ha aceptado tu invitación para participar como speaker en:</p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3 style="color: #333; margin-top: 0;">${eventTitle}</h3>
              <p><strong>🎤 Speaker:</strong> ${speakerName}</p>
              <p><strong>🎯 Tema:</strong> ${topic}</p>
            </div>
            
            <div style="background: #e3f2fd; border: 1px solid #2196F3; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin-top: 0;">📋 Próximos pasos:</h4>
              <ul style="color: #1976d2; margin: 0; padding-left: 20px;">
                <li>Contacta al speaker para coordinar detalles</li>
                <li>Confirma el formato y duración de la presentación</li>
                <li>Revisa los requerimientos técnicos</li>
                <li>Actualiza la información del evento si es necesario</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Puedes gestionar todos los speakers desde tu dashboard de líder de comunidad.
              </p>
              <p style="color: #4CAF50; font-weight: bold;">
                ¡Tu evento está tomando forma! 🚀
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Tech-Ofrenda <noreply@tech-ofrenda.com>',
      to: leaderEmail,
      subject: `✅ Speaker confirmado - ${eventTitle}`,
      html: htmlContent
    })

    console.log(`Speaker acceptance notification sent to ${leaderEmail}`)
  } catch (error) {
    console.error('Error sending speaker acceptance notification email:', error)
    throw new Error('Failed to send speaker acceptance notification email')
  }
}

/**
 * Sends notification to community leader when speaker declines invitation
 */
export async function sendSpeakerDeclineNotificationEmail(data: SpeakerDeclineNotificationEmailData): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return
    }

    const {
      leaderName,
      leaderEmail,
      speakerName,
      eventTitle
    } = data

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invitación declinada - ${eventTitle}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎃 Tech-Ofrenda</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Actualización de invitación</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #ff6b35; margin-top: 0;">Hola ${leaderName},</h2>
            
            <p>Te informamos que <strong>${speakerName}</strong> ha declinado la invitación para participar como speaker en:</p>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #333; margin-top: 0;">${eventTitle}</h3>
              <p style="color: #856404; margin: 0;">
                El speaker no podrá participar en esta ocasión.
              </p>
            </div>
            
            <div style="background: #e3f2fd; border: 1px solid #2196F3; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin-top: 0;">💡 Sugerencias:</h4>
              <ul style="color: #1976d2; margin: 0; padding-left: 20px;">
                <li>Considera invitar a otros speakers de tu lista</li>
                <li>Revisa las solicitudes pendientes de participación</li>
                <li>Publica una convocatoria abierta si es necesario</li>
                <li>Ajusta el programa del evento según sea necesario</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Puedes gestionar speakers e invitaciones desde tu dashboard de líder de comunidad.
              </p>
              <p style="color: #ff6b35; font-weight: bold;">
                ¡No te desanimes, encontrarás el speaker perfecto! 🚀
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Tech-Ofrenda <noreply@tech-ofrenda.com>',
      to: leaderEmail,
      subject: `📋 Invitación declinada - ${eventTitle}`,
      html: htmlContent
    })

    console.log(`Speaker decline notification sent to ${leaderEmail}`)
  } catch (error) {
    console.error('Error sending speaker decline notification email:', error)
    throw new Error('Failed to send speaker decline notification email')
  }
}