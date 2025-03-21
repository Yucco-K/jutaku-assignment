import { router } from '~/lib/trpc/trpc'
import { adminProcedure, publicProcedure, userProcedure } from '../middleware'
import { userRouter } from './user'
import { projectRouter } from './projectRouter'
import { entryRouter } from './entryRouter'
import { skillRouter } from './skillRouter'

/**
 * このファイルは、ルーターを定義するためのファイルです。
 * ルーターは、クライアントからのリクエストを受け取り、
 * リクエストに応じた処理を行います。
 * v10のドキュメントを参照してください。
 * https://trpc.io/docs/v10/
 */
export const appRouter = router({
  user: userRouter,
  project: projectRouter,
  entry: entryRouter,
  skill: skillRouter,
  hello: publicProcedure.query(() => ({ msg: 'Hello World' })),
  userInfo: userProcedure.query(({ ctx: { supabaseUser } }) => {
    return supabaseUser
  }),
  adminInfo: adminProcedure.query(({ ctx: { supabaseUser } }) => {
    return supabaseUser
  })
})

export type AppRouter = typeof appRouter
