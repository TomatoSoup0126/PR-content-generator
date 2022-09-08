import { useState, useEffect, SyntheticEvent } from 'react'
import {
  Option,
  TabPanelProps
} from './interface'

import Box from '@mui/material/Box'

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import SettingsIcon from '@mui/icons-material/Settings'

import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import ActionPanel from './components/ActionPanel';
import SettingPanel from './components/SettingPanel'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)

  const [option, setOption] = useState({
    githubToken: '',
    redmineToken: '',
    redminePath: '',
    isFetchRedmine: true,
    jiraAccount: '',
    jiraToken: '',
    jiraPath: '',
    isFetchJira: true
  })

  const [branches, setBranches] = useState<String[]>(['dev', 'release', 'master'])
  const [repos, setRepos] = useState<String[]>(['demo_repo'])

  // restore option on mounted
  useEffect(() => {
    if (loadDataFromLocalStorage('option')) {
      setOption(loadDataFromLocalStorage('option'))
    }
    if (loadDataFromLocalStorage('branches')) {
      setBranches(loadDataFromLocalStorage('branches'))
    }
    if (loadDataFromLocalStorage('repos')) {
      setRepos(loadDataFromLocalStorage('repos'))
    }
  }, [])

  const handleUpdateOption = (updateOption:Option) => {
    const newOption:Option = {
      ...updateOption
    }
    // @ts-ignore
    setOption(newOption)
    saveDataToLocalStorage('option', newOption)
  }

  const handleDeleteBranchOption = (deleteItem:string) => {
    const updatedBranches = branches.filter(item => item !== deleteItem)
    setBranches(updatedBranches)
    saveDataToLocalStorage('branches', updatedBranches)
  }

  const handleAddBranchOption = (addItem:string) => {
    const updatedBranches = [...branches, addItem]
    setBranches(updatedBranches)
    saveDataToLocalStorage('branches', updatedBranches)
  }

  const handleDeleteRepoOption = (deleteItem:string) => {
    const updatedRepos = repos.filter(item => item !== deleteItem)
    setRepos(updatedRepos)
    saveDataToLocalStorage('repos', updatedRepos)
  }

  const handleAddRepoOption = (addItem:string) => {
    const updatedRepos = [...repos, addItem]
    setRepos(updatedRepos)
    saveDataToLocalStorage('repos', updatedRepos)
  }

  const handleTabChange = (event:SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }

  const saveDataToLocalStorage = (key:string, value:Object) => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  const loadDataFromLocalStorage = (key: string) => {
    if (!localStorage.getItem(key)) {
      return null
    }
    const jsonData:string | null = localStorage.getItem(key)
    return JSON.parse(`${jsonData}`)
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box>
            {children}
          </Box>
        )}
      </div>
    )
  }

  return (
    <main className="container mx-auto p-2 pt-0">
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="icon tabs"
        sx={{ position: 'sticky', top: 0, backgroundColor: 'white' }}
        className="z-10"
      >
        <Tab icon={<AutoFixHighIcon />} aria-label="phone" />
        <Tab icon={<SettingsIcon />} aria-label="favorite" />
      </Tabs>
      <TabPanel value={activeTab} index={0}>
        <ActionPanel
          option={option}
          branches={branches}
          repos={repos}
          loadDataFromLocalStorage={loadDataFromLocalStorage}
          saveDataToLocalStorage={saveDataToLocalStorage}
        >
        </ActionPanel>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <SettingPanel
          option={option}
          branches={branches}
          repos={repos}
          handleUpdateOption={handleUpdateOption}
          handleDeleteBranchOption={handleDeleteBranchOption}
          handleAddBranchOption={handleAddBranchOption}
          handleDeleteRepoOption={handleDeleteRepoOption}
          handleAddRepoOption={handleAddRepoOption}
        />
      </TabPanel>
    </main>
  )
}

export default App
