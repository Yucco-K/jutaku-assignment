import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ユーザーのサンプルデータ
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'user1@example.com' },
      update: {},
      create: {
        name: 'User One',
        email: 'user1@example.com',
        role: UserRole.ADMIN
      }
    }),
    prisma.user.upsert({
      where: { email: 'user2@example.com' },
      update: {},
      create: {
        name: 'User Two',
        email: 'user2@example.com',
        role: UserRole.USER
      }
    }),
    prisma.user.upsert({
      where: { email: 'user3@example.com' },
      update: {},
      create: {
        name: 'User Three',
        email: 'user3@example.com',
        role: UserRole.USER
      }
    }),
    prisma.user.upsert({
      where: { email: 'user4@example.com' },
      update: {},
      create: {
        name: 'User Four',
        email: 'user4@example.com',
        role: UserRole.ADMIN
      }
    })
  ])

  // 案件のサンプルデータ
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: 'Webアプリ開発',
        description: 'Reactを用いた開発案件',
        price: 500000,
        deadline: new Date('2025-04-01'),
        created_at: new Date(),
        creator: { connect: { id: users[0].id } }
      }
    }),
    prisma.project.create({
      data: {
        title: 'モバイルアプリ開発',
        description: 'iOS/Androidアプリの開発',
        price: 800000,
        deadline: new Date('2025-05-01'),
        created_at: new Date(),
        creator: { connect: { id: users[1].id } }
      }
    }),
    prisma.project.create({
      data: {
        title: 'PHPシステム開発',
        description: 'PHPを用いたシステム構築',
        price: 600000,
        deadline: new Date('2025-06-01'),
        created_at: new Date(),
        creator: { connect: { id: users[2].id } }
      }
    }),
    prisma.project.create({
      data: {
        title: 'Javaアプリ開発',
        description: 'Javaによる業務アプリ開発',
        price: 700000,
        deadline: new Date('2025-07-01'),
        created_at: new Date(),
        creator: { connect: { id: users[3].id } }
      }
    })
  ])

  // エントリーのサンプルデータ
  await Promise.all([
    prisma.entry.create({
      data: {
        status: 'PENDING',
        entry_date: new Date(),
        project: { connect: { id: projects[0].id } },
        user: { connect: { id: users[1].id } }
      }
    }),
    prisma.entry.create({
      data: {
        status: 'APPROVED',
        entry_date: new Date(),
        project: { connect: { id: projects[1].id } },
        user: { connect: { id: users[0].id } }
      }
    }),
    prisma.entry.create({
      data: {
        status: 'PENDING',
        entry_date: new Date(),
        project: { connect: { id: projects[2].id } },
        user: { connect: { id: users[3].id } }
      }
    }),
    prisma.entry.create({
      data: {
        status: 'REJECTED',
        entry_date: new Date(),
        project: { connect: { id: projects[3].id } },
        user: { connect: { id: users[2].id } }
      }
    })
  ])

  // スキルのサンプルデータ
  const skills = [
    'React',
    'TypeScript',
    'Node.js',
    'Flutter',
    'Dart',
    'PHP',
    'Laravel',
    'Java'
  ]

  // すべてのスキルを一括で作成
  await Promise.all(
    skills.map((skill) =>
      prisma.skill.upsert({
        where: { name: skill },
        update: {},
        create: { name: skill }
      })
    )
  )

  // すべてのスキルを取得
  const skillRecords = await prisma.skill.findMany()
  const skillMap = skillRecords.reduce(
    (acc, skill) => {
      acc[skill.name] = skill.id
      return acc
    },
    {} as Record<string, string>
  )

  // ProjectSkill テーブルのデータを作成
  await prisma.projectSkill.createMany({
    data: skills
      .map((skill) => {
        if (!skillMap[skill]) return null
        return {
          project_id:
            skill === 'React' || skill === 'TypeScript'
              ? projects[0].id
              : skill === 'Flutter' || skill === 'Dart'
                ? projects[1].id
                : skill === 'PHP' || skill === 'Laravel'
                  ? projects[2].id
                  : projects[3].id,
          skill_id: skillMap[skill]
        }
      })
      .filter(
        (item): item is { project_id: string; skill_id: string } =>
          item !== null
      )
  })

  console.log('✅ Seeding completed!')
}

await main()
  .then(async () => {
    console.log('✅ Database seeding successful!')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
