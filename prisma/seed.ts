import { PrismaClient, UserRole, EventCategory, EventStatus, SponsorLevel, CollaboratorRole, ContributionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const communityLeader1 = await prisma.user.create({
    data: {
      email: 'leader.cdmx@techofrenda.com',
      name: 'María González',
      role: UserRole.COMMUNITY_LEADER,
    },
  })

  const communityLeader2 = await prisma.user.create({
    data: {
      email: 'leader.guadalajara@techofrenda.com',
      name: 'Carlos Rodríguez',
      role: UserRole.COMMUNITY_LEADER,
    },
  })

  const speaker1 = await prisma.user.create({
    data: {
      email: 'speaker1@example.com',
      name: 'Ana Martínez',
      role: UserRole.SPEAKER,
    },
  })

  const attendee1 = await prisma.user.create({
    data: {
      email: 'attendee1@example.com',
      name: 'Luis Hernández',
      role: UserRole.ATTENDEE,
    },
  })

  const attendee2 = await prisma.user.create({
    data: {
      email: 'attendee2@example.com',
      name: 'Sofia López',
      role: UserRole.ATTENDEE,
    },
  })

  // Create User Groups
  const userGroupCDMX = await prisma.userGroup.create({
    data: {
      name: 'Tech Community CDMX',
      city: 'Ciudad de México',
      leaderId: communityLeader1.id,
    },
  })

  const userGroupGDL = await prisma.userGroup.create({
    data: {
      name: 'Tech Community Guadalajara',
      city: 'Guadalajara',
      leaderId: communityLeader2.id,
    },
  })

  // Update users to belong to their user groups
  await prisma.user.update({
    where: { id: communityLeader1.id },
    data: { userGroupId: userGroupCDMX.id },
  })

  await prisma.user.update({
    where: { id: communityLeader2.id },
    data: { userGroupId: userGroupGDL.id },
  })

  await prisma.user.update({
    where: { id: speaker1.id },
    data: { userGroupId: userGroupCDMX.id },
  })

  await prisma.user.update({
    where: { id: attendee1.id },
    data: { userGroupId: userGroupCDMX.id },
  })

  await prisma.user.update({
    where: { id: attendee2.id },
    data: { userGroupId: userGroupGDL.id },
  })

  // Create sample events
  const event1 = await prisma.event.create({
    data: {
      title: 'Hackathon Día de Muertos CDMX 2024',
      description: 'Un hackathon especial para celebrar el Día de Muertos con tecnología y tradición mexicana.',
      date: new Date('2024-11-02T09:00:00Z'),
      location: 'Centro de Innovación CDMX',
      capacity: 100,
      category: EventCategory.HACKATHON,
      status: EventStatus.PUBLISHED,
      userGroupId: userGroupCDMX.id,
    },
  })

  const event2 = await prisma.event.create({
    data: {
      title: 'Meetup: React y Next.js en el Altar Digital',
      description: 'Aprende a crear aplicaciones web modernas con React y Next.js, inspiradas en las tradiciones mexicanas.',
      date: new Date('2024-11-15T18:00:00Z'),
      location: 'Coworking Guadalajara Tech',
      capacity: 50,
      category: EventCategory.MEETUP,
      status: EventStatus.PUBLISHED,
      userGroupId: userGroupGDL.id,
    },
  })

  // Create sample attendees with QR codes
  await prisma.attendee.create({
    data: {
      userId: attendee1.id,
      eventId: event1.id,
      qrCode: 'QR_' + Math.random().toString(36).substring(2, 15),
    },
  })

  await prisma.attendee.create({
    data: {
      userId: attendee2.id,
      eventId: event2.id,
      qrCode: 'QR_' + Math.random().toString(36).substring(2, 15),
    },
  })

  // Create sample speakers
  await prisma.speaker.create({
    data: {
      userId: speaker1.id,
      eventId: event1.id,
      topic: 'Desarrollo Frontend con Temática Cultural',
      bio: 'Desarrolladora frontend especializada en experiencias de usuario culturalmente relevantes.',
      confirmed: true,
      confirmedAt: new Date(),
    },
  })

  // Create sample sponsors
  await prisma.sponsor.create({
    data: {
      name: 'TechCorp México',
      email: 'sponsors@techcorp.mx',
      website: 'https://techcorp.mx',
      level: SponsorLevel.GOLD,
      userGroupId: userGroupCDMX.id,
      eventId: event1.id,
    },
  })

  await prisma.sponsor.create({
    data: {
      name: 'Innovación Digital GDL',
      email: 'contacto@innovaciongdl.com',
      website: 'https://innovaciongdl.com',
      level: SponsorLevel.SILVER,
      userGroupId: userGroupGDL.id,
      eventId: event2.id,
    },
  })

  // Create sample collaborators
  await prisma.collaborator.create({
    data: {
      userId: attendee1.id,
      eventId: event1.id,
      userGroupId: userGroupCDMX.id,
      role: CollaboratorRole.VOLUNTEER,
    },
  })

  // Create sample contributions
  await prisma.contribution.create({
    data: {
      eventId: event1.id,
      type: ContributionType.MONETARY,
      amount: 5000.0,
      donorName: 'Empresa Tecnológica ABC',
      donorEmail: 'donaciones@empresaabc.com',
      confirmed: true,
    },
  })

  await prisma.contribution.create({
    data: {
      eventId: event1.id,
      type: ContributionType.IN_KIND,
      description: 'Laptops para participantes del hackathon',
      donorName: 'Hardware Solutions MX',
      donorEmail: 'contacto@hardwaresolutions.mx',
      confirmed: false,
    },
  })

  await prisma.contribution.create({
    data: {
      eventId: event2.id,
      type: ContributionType.MONETARY,
      amount: 2500.0,
      donorName: 'Startup Incubator GDL',
      donorEmail: 'info@startupgdl.com',
      confirmed: true,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('📊 Created:')
  console.log('  - 5 users (2 community leaders, 1 speaker, 2 attendees)')
  console.log('  - 2 user groups (CDMX, Guadalajara)')
  console.log('  - 2 events (1 hackathon, 1 meetup)')
  console.log('  - 2 attendee registrations with QR codes')
  console.log('  - 1 speaker registration')
  console.log('  - 2 sponsors')
  console.log('  - 1 collaborator')
  console.log('  - 3 contributions (2 monetary, 1 in-kind)')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })