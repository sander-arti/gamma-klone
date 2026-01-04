import prisma from '../src/lib/db/prisma';

async function main() {
  const deck = await prisma.deck.findFirst({
    orderBy: { createdAt: 'desc' },
    select: {
      outline: true,
    }
  });

  if (deck === null || deck.outline === null) {
    console.log('No deck/outline found');
    return;
  }

  const outline = deck.outline as {
    title: string;
    slides: Array<{
      title: string;
      type?: string;
      suggestedType?: string;
      hints?: string[];
    }>
  };

  console.log('=== RAW OUTLINE ===');
  console.log('Title:', outline.title);
  console.log('Slides count:', outline.slides.length);
  console.log('\n=== EACH SLIDE ===');

  outline.slides.forEach((slide, i) => {
    console.log(`\n${i + 1}. Title: ${slide.title}`);
    console.log(`   type: ${slide.type || 'undefined'}`);
    console.log(`   suggestedType: ${slide.suggestedType || 'undefined'}`);
    console.log(`   hints: ${JSON.stringify(slide.hints || [])}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
