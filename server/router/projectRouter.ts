import { z } from 'zod'
import { router } from '~/lib/trpc/trpc'
import { userProcedure, adminProcedure } from '../middleware'
import { projectRepository } from '../repository/projectRepository'
import { TRPCError } from '@trpc/server'

export const projectRouter = router({
  list: userProcedure.query(async () => projectRepository.findMany()),

  find: userProcedure
    .input(z.string())
    .query(async ({ input }) => projectRepository.findUnique(input)),

  create: userProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        skillNames: z.array(z.string()), // ✅ 修正: `skillIds` → `skillNames`
        price: z.number().optional(),
        deadline: z
          .string()
          .transform((str) => new Date(str))
          .optional()
      })
    )
    .mutation(async ({ input, ctx: { userId } }) =>
      projectRepository.create(
        { ...input, creator: { connect: { id: userId } } },
        userId,
        input.skillNames
      )
    ),

  update: userProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        skillNames: z.array(z.string()),
        price: z.number().optional(),
        deadline: z
          .string()
          .transform((str) => new Date(str))
          .optional()
      })
    )
    .mutation(async ({ input, ctx: { userId } }) => {
      const { id, skillNames, ...data } = input
      const project = await projectRepository.findUnique(id)
      if (!project)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' })
      // if (project.creator_id !== userId)
      //   throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })

      // ✅ プロジェクト情報を更新
      await projectRepository.update({ id, data })

      // ✅ スキルを更新
      return projectRepository.updateProjectSkills(id, skillNames)
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ input }) => projectRepository.delete(input)),

  // ✅ ProjectSkillを取得するエンドポイント
  projectSkills: userProcedure
    .input(z.string()) // projectId を入力
    .query(async ({ input }) => {
      return await projectRepository.getProjectSkills(input)
    }),

  // ✅ ProjectSkill を更新するエンドポイントを追加
  updateSkills: userProcedure
    .input(
      z.object({
        projectId: z.string(),
        skillNames: z.array(z.string())
      })
    )
    .mutation(async ({ input }) => {
      return projectRepository.updateProjectSkills(
        input.projectId,
        input.skillNames
      )
    })
})
