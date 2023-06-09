import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function seed() {
  const mannan = await db.user.create({
    data: {
      username: 'mannan',
      // this is a hashed version of "twixrox"
      passwordHash:
        '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
    },
  });
  await Promise.all(
    getExpenses().map((expense) => {
      const data = { userId: mannan.id, ...expense };
      return db.expenses.create({ data: data });
    })
  );
}

seed();

function getExpenses() {
  // shout-out to https://icanhazdadjoke.com/

  return [
    {
      title: 'Apple',
      category: `Groceris`,
      paid_by: 'cc',
      amount: 40,
    },
    {
      title: 'Bhindi',
      category: `Groceris`,
      paid_by: 'cash',
      amount: 10,
    },
    {
      title: 'Kiwi',
      category: `Groceris`,
      paid_by: 'cc',
      amount: 140,
    },
    {
      title: 'Orange',
      category: `Groceris`,
      paid_by: 'cash',
      amount: 120,
    },
  ];
}
