import { useState, useEffect, useContext, SyntheticEvent, forwardRef } from 'react'
import { Option, TabPanelProps } from '../interface'

import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles'

import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import SettingsIcon from '@mui/icons-material/Settings'

import ActionPanel from './ActionPanel'
import SettingPanel from './SettingPanel'

import { ColorModeContext } from '../ThemeWrapper'

const App: React.FC = () => {
  const theme = useTheme()
  const colorMode = useContext(ColorModeContext)
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

  const [isShowOptionSuccess, setIsShowOptionSuccess] = useState(false)

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

  const handleSaveTheme = () => {
    saveDataToLocalStorage('theme', theme.palette.mode === 'dark' ? 'light' : 'dark')
    colorMode.toggleColorMode()
  }

  const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const handleUpdateOption = (updateOption:Option) => {
    const newOption:Option = {
      ...updateOption
    }
    // @ts-ignore
    setOption(newOption)
    saveDataToLocalStorage('option', newOption)
    saveOptionSuccess()
  }

  const handleSnackbarClose = () => {
    setIsShowOptionSuccess(false)
  }

  const saveOptionSuccess = () => {
    setIsShowOptionSuccess(true);
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
    setActiveTab(newValue)
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
    const { children, value, index, ...other } = props

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
      <Snackbar
        open={isShowOptionSuccess}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: '100%' }}
        >
          Save success!
        </Alert>
      </Snackbar>
      <Box sx={{
          position: 'sticky',
          top: 0,
          backgroundColor: theme.palette.background.default,
          zIndex: 10
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="icon tabs"
          className="z-10"
        >
          <Tab icon={<AutoFixHighIcon />} aria-label="phone" />
          <Tab icon={<SettingsIcon />} aria-label="favorite" />
        </Tabs>
        <div className="absolute top-[8px] right-[4px] z-20">
          <IconButton
            onClick={handleSaveTheme}
            color="inherit"
          >
            {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </div>
      </Box>
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
