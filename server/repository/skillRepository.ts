import type { Skill } from '@prisma/client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const skillRepository = {
  // ✅ スキル一覧を取得（READ ONLY）
  async findMany(): Promise<Skill[]> {
    return prisma.skill.findMany({ orderBy: { name: 'asc' } })
  },

  // ✅ スキル名で検索（READ ONLY）
  async findByName(name: string): Promise<Skill | null> {
    return prisma.skill.findUnique({ where: { name } })
  }
}
