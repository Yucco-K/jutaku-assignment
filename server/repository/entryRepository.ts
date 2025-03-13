import type { Prisma, Entry, EntryStatus } from '@prisma/client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const entryRepository = {
  async create(
    data: Prisma.EntryCreateInput & { status: EntryStatus },
    projectId: string,
    userId: string,
    entryDate: string
  ): Promise<Entry> {
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
