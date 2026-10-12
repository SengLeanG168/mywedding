import prisma from '../lib/prisma';
import { getEventTitle } from '../lib/event-helpers';

async function backfillEvents() {
  const events = await prisma.event.findMany();
  console.log(`Found ${events.length} total events in DB.`);

  for (const event of events) {
    if (!event.eventTitle || !String(event.eventTitle).trim()) {
      const fallbackTitle = getEventTitle(event, true);
      console.log(`Backfilling event ${event.id} (${event.slug}) with eventTitle: "${fallbackTitle}"`);
      await prisma.event.update({
        where: { id: event.id },
        data: {
          eventTitle: fallbackTitle,
          eventType: event.eventType || 'wedding',
        },
      });
    } else {
      console.log(`Event ${event.id} (${event.slug}) already has eventTitle: "${event.eventTitle}"`);
    }
  }

  console.log('Backfill complete.');
}

backfillEvents()
  .catch((e) => {
    console.error('Backfill error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
