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
  isFetchRedmine: Boolean
  jiraAccount: String
  jiraToken: String
  jiraPath: String
  isFetchJira: Boolean
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

export interface EditableListProps {
  label: String
  list: (String[] | undefined[])
  handleDeleteItem: Function
  handleAddItem: Function
  children?: ReactNode
}

export interface IssueBlockProps {
  title: String
  issues: (Commit[] | undefined[])
  content?: String
  handleCopyEvent: Function
  children: ReactNode
}

export interface ErrorListProps {
  errors: (String[] | undefined[])
  children: ReactNode
}

export interface SettingPanelProps {
  option: Object
  branches: (String[] | undefined[])
  repos: (String[] | undefined[])
  handleUpdateOption: Function
  handleDeleteBranchOption: Function
  handleAddBranchOption: Function
  handleDeleteRepoOption: Function
  handleAddRepoOption: Function
  children?: ReactNode
}
