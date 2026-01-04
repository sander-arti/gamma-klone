import prisma from '../src/lib/db/prisma';

async function main() {
  // Get the most recent deck
  const deck = await prisma.deck.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true }
  });

  if (!deck) {
    console.log('No deck found');
    return;
  }

  console.log('Deck:', deck.id, deck.title);

  // Find generation job for this deck
  const job = await prisma.generationJob.findFirst({
    where: { deckId: deck.id },
    orderBy: { createdAt: 'desc' }
  });

  if (!job) {
    console.log('No generation job found for this deck');
    return;
  }

  console.log('\n=== GENERATION JOB ===');
  console.log('ID:', job.id);
  console.log('Status:', job.status);
  console.log('Progress:', job.progress);
  console.log('numSlides:', job.numSlides);
  console.log('viewUrl:', job.viewUrl);
  console.log('deckId:', job.deckId);
  console.log('textMode:', job.textMode);
  console.log('imageMode:', job.imageMode);
  console.log('templateId:', job.templateId);
  console.log('errorCode:', job.errorCode);
  console.log('errorMessage:', job.errorMessage);
  console.log('createdAt:', job.createdAt);
  console.log('startedAt:', job.startedAt);
  console.log('completedAt:', job.completedAt);
}

main().catch(console.error).finally(() => prisma.$disconnect());
