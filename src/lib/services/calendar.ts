export interface CalendarEventData {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
}

/**
 * Generates a Google Calendar URL for adding an event
 * @param eventData - The event data to add to calendar
 * @returns Google Calendar URL
 */
export function generateGoogleCalendarUrl(eventData: CalendarEventData): string {
  const { title, description, startDate, endDate, location } = eventData
  
  // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const startDateFormatted = formatDate(startDate)
  const endDateFormatted = formatDate(endDate)
  
  // Clean description for URL
  const cleanDescription = description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim()
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startDateFormatted}/${endDateFormatted}`,
    details: cleanDescription,
    location: location,
    sf: 'true',
    output: 'xml'
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generates calendar event data from event information
 * @param event - Event object with date, title, description, location
 * @param durationHours - Duration of the event in hours (default: 2)
 * @returns CalendarEventData object
 */
export function createCalendarEventData(
  event: {
    title: string
    description: string
    date: Date
    location: string
  },
  durationHours: number = 2
): CalendarEventData {
  const startDate = new Date(event.date)
  const endDate = new Date(startDate.getTime() + (durationHours * 60 * 60 * 1000))

  return {
    title: event.title,
    description: event.description,
    startDate,
    endDate,
    location: event.location
  }
}