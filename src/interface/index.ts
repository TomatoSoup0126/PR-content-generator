import { ReactNode } from 'react'

export interface ApplyStatus {
  isFetchRedmine: Boolean
  isFetchJira: Boolean
}

export interface Option {
  owner: String
  repo: String
  githubToken: String
  redmineToken: String
  redminePath: String
  jiraAccount: String
  jiraToken: String
  jiraPath: String
}

export interface Branch {
  into: String
  from: String
}

export interface Commit {
  id: any
  subject: any
  status: any
  markdown: String
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface BranchListProps {
  branches: String[]
  handleDeleteBranchOption: Function
  handleAddBranchOption: Function
  children: ReactNode
}

export interface IssueBlockProps {
  title: String
  issues: (Commit[] | undefined[])
  handleCopyEvent: Function
  children: ReactNode
}
