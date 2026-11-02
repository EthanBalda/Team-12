import { Prisma } from '../../prisma/generated/prisma';
import { prisma } from '../libs/db'

const worldData: Prisma.WorldCreateInput[] = [
  {
    worldID: 'greensaltedapples',
    passwordHash: '$2b$17$yt2/4j3ARQl4/l9MUqLhnOSh8/61KM/CozHic28B8bRikkbKTneT6',
    name: 'Joe Bob\'s Empire',
  },
  {
    worldID: 'redcandycanes',
    passwordHash: '$2b$17$8Zah09TtvXwIaIQ/eYvRUOq1q7nYKmw5wtbEOmypnBwkpygsdrnwq',
    name: 'Nancy Drew\'s Hideout',
  }
];

export async function generateDB() {
  for (const world of worldData) {
    await prisma.world.create({ data: world });
  }
}

generateDB();