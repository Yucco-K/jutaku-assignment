import { z } from 'zod'
import { router } from '~/lib/trpc/trpc'
import { userRepository } from '../repository/user'
import { userProcedure } from '../middleware'

export const userRouter = router({
  list: userProcedure.query(async () => {
    return await userRepository.findMany()
  }),
  find: userProcedure.input(z.string()).query(async ({ input }) => {
    return await userRepository.findUnique(input)
  }),
  create: userProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email()
      })
    )
    .mutation(async ({ input, ctx: { userId } }) => {
      console.log('create', { userId, input })
      // 認証プロバイダー（supabase）のユーザーIDを指定して作成
      return await userRepository.create({
        id: userId,
        name: input.name,
        email: input.email,
        password: 'defaultPassword123' // 🔥 仮のパスワードを追加
      })
    }),
  update: userProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email()
      })
    )
    .mutation(async ({ input }) => {
      return await userRepository.update({
        id: input.id,
        data: input
      })
    }),
  delete: userProcedure.input(z.string()).mutation(async ({ input }) => {
    return await userRepository.delete(input)
  })
})
