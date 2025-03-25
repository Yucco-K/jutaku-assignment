import { z } from 'zod'
import { router } from '~/lib/trpc/trpc'
import { userProcedure } from '../middleware'
import { entryRepository } from '../repository/entryRepository'
import { TRPCError } from '@trpc/server'
import type { EntryStatus } from '@prisma/client'

const EntryStatusEnum = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'WITHDRAWN'
]) as z.ZodType<EntryStatus>

export const entryRouter = router({
  list: userProcedure
    .input(
      z.object({
        status: EntryStatusEnum.optional(),
        project_id: z.string().optional()
      })
    )
    .query(async ({ input, ctx: { userId } }) =>
      entryRepository.findMany(input.status, userId, input.project_id)
    ),

  findMany: userProcedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .query(async ({ input }) => {
      return entryRepository.findMany(undefined, undefined, input.projectId)
    }),

  find: userProcedure
    .input(z.object({ project_id: z.string(), user_id: z.string() }))
    .query(async ({ input }) => entryRepository.findUnique(input)),

  create: userProcedure
    .input(
      z.object({
        project_id: z.string(),
        entry_date: z.string().optional(),
        status: EntryStatusEnum
      })
    )
    .mutation(async ({ input, ctx: { userId } }) =>
      entryRepository.createOrUpdate(
        {
          status: input.status,
          project: { connect: { id: input.project_id } },
          user: { connect: { id: userId } }
        },
        input.project_id,
        userId,
        input.entry_date ?? new Date().toISOString()
      )
    ),

  update: userProcedure
    .input(
      z.object({
        project_id: z.string(),
        user_id: z.string(),
        status: EntryStatusEnum.optional()
      })
    )
    .mutation(async ({ input }) => {
      const entry = await entryRepository.findUnique({
        project_id: input.project_id,
        user_id: input.user_id
      })
      if (!entry)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Entry not found' })
      return entryRepository.update({
        project_id: input.project_id,
        user_id: input.user_id,
        data: { status: input.status }
      })
    }),

  delete: userProcedure
    .input(z.object({ project_id: z.string(), user_id: z.string() }))
    .mutation(async ({ input }) => entryRepository.delete(input))
})
