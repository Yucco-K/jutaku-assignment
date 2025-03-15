import type { Prisma, Entry, EntryStatus } from '@prisma/client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const entryRepository = {
  async createOrUpdate(
    data: Prisma.EntryCreateInput & { status: EntryStatus },
    projectId: string,
    userId: string,
    entryDate: string
  ): Promise<Entry> {
    // 重複チェック
    const existingEntry = await prisma.entry.findUnique({
      where: { project_id_user_id: { project_id: projectId, user_id: userId } }
    })

    // 重複がない場合は新規作成
    if (!existingEntry) {
      return prisma.entry.create({
        data: {
          ...data,
          status: data.status,
          entry_date: new Date(entryDate),
          project: {
            connect: { id: projectId }
          },
          user: {
            connect: { id: userId }
          }
        }
      })
    }

    // 重複がある場合は更新
    return prisma.entry.update({
      where: { project_id_user_id: { project_id: projectId, user_id: userId } },
      data: { status: data.status } // 必要なフィールドのみ更新
    })
  },

  async findMany(
    status?: EntryStatus,
    userId?: string,
    projectId?: string
  ): Promise<Entry[]> {
    return prisma.entry.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(userId ? { user_id: userId } : {}),
        ...(projectId ? { project_id: projectId } : {})
      },
      orderBy: { entry_date: 'desc' },
      include: {
        project: { select: { title: true, price: true } },
        user: true
      }
    })
  },

  async findUnique({
    project_id,
    user_id
  }: { project_id: string; user_id: string }): Promise<Entry | null> {
    return prisma.entry.findUnique({
      where: { project_id_user_id: { project_id, user_id } },
      include: {
        project: true,
        user: true
      }
    })
  },

  async update({
    project_id,
    user_id,
    data
  }: {
    project_id: string
    user_id: string
    data: Prisma.EntryUpdateInput
  }): Promise<Entry> {
    return prisma.entry.update({
      where: { project_id_user_id: { project_id, user_id } },
      data
    })
  },

  async delete({
    project_id,
    user_id
  }: { project_id: string; user_id: string }): Promise<Entry> {
    return prisma.entry.delete({
      where: { project_id_user_id: { project_id, user_id } }
    })
  }
}
