import { z } from 'zod'
import { router } from '~/lib/trpc/trpc'
import { userRepository } from '../repository/user'
import { userProcedure } from '../middleware'

export const userRouter = router({
  whoami: userProcedure.query(async ({ ctx }) => {
    try {
      console.log(`🔍 whoami: ctx.userId: ${ctx.userId}`)
      console.log('🔍 whoami: ctx.supabaseUser:', ctx.supabaseUser)

      if (!ctx.supabaseUser) {
        console.error('🚨 whoami エラー: ctx.supabaseUser が null')
        return null
      }

      const user = await userRepository.findUnique(ctx.userId)

      if (!user) {
        console.error(
          `🚨 whoami エラー: userRepository.findUnique() でユーザーが見つからない (userId=${ctx.userId})`
        )
        return null
      }

      return user
    } catch (error) {
      console.error('🚨 whoami エラー:', error)
      throw new Error('whoami でエラーが発生しました')
    }
  })
})
