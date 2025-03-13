import { z } from 'zod'
import { router } from '~/lib/trpc/trpc'
import { skillRepository } from '../repository/skillRepository'
import { userProcedure } from '../middleware'

export const skillRouter = router({
  // ✅ スキル一覧の取得（READ ONLY）
  list: userProcedure.query(async () => skillRepository.findMany()),

  // ✅ スキル名で検索（READ ONLY）
  find: userProcedure
    .input(z.string())
    .query(async ({ input }) => skillRepository.findByName(input))
})
