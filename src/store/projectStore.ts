import { create } from 'zustand'
import { nanoid } from 'nanoid'

// プロジェクトの型
interface Project {
  id: string
  name: string
  description: string
  skills: string[]
  deadline: string
  price: string
  date: string
}

// Zustand ストア
interface ProjectState {
  projects: Project[]
  selectedProject: Project | null
  loadProjectById: (id: string) => void
  loadProjects: () => void
  addProject: (project: Project) => void
  updateProject: (id: string, project: Omit<Project, 'id' | 'date'>) => void
  deleteProject: (id: string) => void
}

const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,

  // ✅ `projectId` に基づいてプロジェクトを取得
  loadProjectById: (id) => {
    if (typeof window !== 'undefined') {
      const storedProjects = localStorage.getItem('projects')
      if (storedProjects) {
        const projects: Project[] = JSON.parse(storedProjects)
        const foundProject = projects.find((p) => p.id === id) || null
        set({ selectedProject: foundProject })
      }
    }
  },

  // ✅ 全プロジェクトをロード
  loadProjects: () => {
    if (typeof window !== 'undefined') {
      const storedProjects = localStorage.getItem('projects')
      if (storedProjects) {
        set({ projects: JSON.parse(storedProjects) })
      }
    }
  },

  addProject: (project) => {
    const { projects } = get()
    const newProjects = [...projects, project]
    localStorage.setItem('projects', JSON.stringify(newProjects))
    set({ projects: newProjects })
  },

  updateProject: (id, projectData) => {
    const { projects } = get()
    const newProjects = projects.map((p) =>
      p.id === id ? { ...p, ...projectData } : p
    )
    localStorage.setItem('projects', JSON.stringify(newProjects))
    set({ projects: newProjects })
  },

  deleteProject: (id) => {
    const { projects } = get()
    const newProjects = projects.filter((p) => p.id !== id)
    localStorage.setItem('projects', JSON.stringify(newProjects))
    set({ projects: newProjects })
  }
}))

export default useProjectStore
