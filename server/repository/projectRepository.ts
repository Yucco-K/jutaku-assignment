import type { Prisma, Project } from '@prisma/client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const projectRepository = {
  // ✅ プロジェクトの作成
  async create(
    data: Omit<Prisma.ProjectCreateInput, 'skills'>, // `skills` は手動で追加
    creatorId: string,
    skillNames: string[] // ✅ skillIds ではなく skillNames を受け取る
  ): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        deadline: data.deadline ? new Date(data.deadline) : null,
        creator: {
          connect: { id: creatorId }
        }
      }
    })

    // ✅ スキルの取得
    const skillIds = await Promise.all(
      skillNames.map(async (name) => {
        const skill = await prisma.skill.findUnique({ where: { name } })

        // スキルが存在しない場合はエラーを投げる
        if (!skill) {
          throw new Error(
            `スキル "${name}" は存在しません。事前に作成してください。`
          )
        }

        return skill.id
      })
    )

    // ✅ ProjectSkill にスキルを登録
    if (skillIds.length > 0) {
      await prisma.projectSkill.createMany({
        data: skillIds.map((skillId) => ({
          project_id: project.id,
          skill_id: skillId
        }))
      })
    }

    return project
  },

  // ✅ プロジェクト一覧取得
  async findMany(): Promise<Project[]> {
    return prisma.project.findMany({
      include: {
        skills: {
          include: { skill: true }
        }
      },
      orderBy: { created_at: 'desc' }
    })
  },

  // ✅ 特定のプロジェクト取得
  async findUnique(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      include: { skills: { include: { skill: true } }, creator: true }
    })
  },

  // ✅ プロジェクトの更新
  async update({
    id,
    data
  }: { id: string; data: Prisma.ProjectUpdateInput }): Promise<Project> {
    return prisma.project.update({ where: { id }, data })
  },

  // ✅ プロジェクトの削除
  async delete(id: string): Promise<Project> {
    return prisma.project.delete({ where: { id } })
  },

  // ✅ ProjectSkillを取得
  async getProjectSkills(projectId: string) {
    return prisma.projectSkill.findMany({
      where: { project_id: projectId },
      include: { skill: true }
    })
  },

  // ✅ ProjectSkill を更新
  async updateProjectSkills(projectId: string, skillNames: string[]) {
    const skillIds = await Promise.all(
      skillNames.map(async (name) => {
        const skill = await prisma.skill.findUnique({ where: { name } })

        // スキルが存在しない場合はエラーを投げる
        if (!skill) {
          throw new Error(
            `スキル "${name}" は存在しません。事前に作成してください。`
          )
        }

        return skill.id
      })
    )

    // 2️⃣ 現在のプロジェクトのスキル一覧を取得
    const currentProjectSkills = await prisma.projectSkill.findMany({
      where: { project_id: projectId },
      select: { skill_id: true }
    })

    const currentSkillIds = currentProjectSkills.map((ps) => ps.skill_id)

    // 3️⃣ 追加すべきスキルを特定
    const skillsToAdd = skillIds.filter(
      (skillId) => !currentSkillIds.includes(skillId)
    )

    // 4️⃣ 削除すべきスキルを特定
    const skillsToRemove = currentSkillIds.filter(
      (skillId) => !skillIds.includes(skillId)
    )

    // 5️⃣ 必要なスキルを追加
    if (skillsToAdd.length > 0) {
      await prisma.projectSkill.createMany({
        data: skillsToAdd.map((skillId) => ({
          project_id: projectId,
          skill_id: skillId
        }))
      })
    }

    // 6️⃣ 不要なスキルを削除
    if (skillsToRemove.length > 0) {
      await prisma.projectSkill.deleteMany({
        where: {
          project_id: projectId,
          skill_id: { in: skillsToRemove }
        }
      })
    }

    // 7️⃣ 更新後のプロジェクトを取得して返す
    return prisma.project.findUnique({
      where: { id: projectId },
      include: { skills: { include: { skill: true } } }
    })
  }
}
