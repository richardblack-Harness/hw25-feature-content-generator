import type { ReactNode } from "react"

export interface PromptTemplate {
  id: string
  name: string
  description: string
  icon: ReactNode
  color: string
  isCustom?: boolean
}

