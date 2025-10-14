const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFeedback() {
  try {
    console.log('Testing feedback.findMany...');
    const feedbacks = await prisma.feedback.findMany({
      take: 1
    });
    console.log('Success! Found feedbacks:', feedbacks.length);
    console.log('First feedback:', feedbacks[0] || 'No feedbacks found');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFeedback();