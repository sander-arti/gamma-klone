import prisma from '../src/lib/db/prisma';

async function main() {
  const deck = await prisma.deck.findFirst({
    orderBy: { createdAt: 'desc' },
    select: {
      outline: true,
      slides: {
        orderBy: { position: 'asc' },
        select: { position: true, type: true }
      }
    }
  });

  if (deck === null) {
    console.log('No deck found');
    return;
  }

  const outline = deck.outline as { slides: Array<{ type?: string; suggestedType?: string; title: string }> } | null;

  if (outline === null) {
    console.log('No outline found');
    return;
  }

  console.log('=== OUTLINE SLIDES ===');
  outline.slides.forEach((slide, i) => {
    console.log(`${i + 1}. [${slide.type || slide.suggestedType || 'unknown'}] ${slide.title}`);
  });

  console.log('\n=== DATABASE SLIDES ===');
  deck.slides.forEach((slide, i) => {
    console.log(`${i + 1}. [${slide.type}] position=${slide.position}`);
  });

  console.log('\n=== COMPARISON ===');
  console.log('Outline count:', outline.slides.length);
  console.log('DB count:', deck.slides.length);
  console.log('Missing:', outline.slides.length - deck.slides.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
