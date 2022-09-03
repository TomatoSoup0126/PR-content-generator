import { useState, useEffect, useMemo, SyntheticEvent } from 'react'
import {
  ApplyStatus,
  Option,
  Branch,
  Commit,
  TabPanelProps
} from './interface'

import { grey, red, blue } from '@mui/material/colors';
import Box from '@mui/material/Box'
import GitHubIcon from '@mui/icons-material/GitHub'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import ForkRightIcon from '@mui/icons-material/ForkRight'
import KeyIcon from '@mui/icons-material/Key'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import SettingsIcon from '@mui/icons-material/Settings'
import DnsIcon from '@mui/icons-material/Dns'

import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormGroup from '@mui/material/FormGroup'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import BranchList from './components/BranchList'
import IssueBlock from './components/IssueBlock'

import { clipboard } from 'electron'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)

  const [option, setOption] = useState({
    owner: '',
    repo: '',
    githubToken: '',
    redmineToken: '',
    redminePath: '',
    jiraAccount: '',
    jiraToken: '',
    jiraPath: '',
  })

  const [branch, setBranch] = useState({
    into: '',
    from: ''
  })

  const [applyStatus, setApplyStatus] = useState({
    isFetchRedmine: true,
    isFetchJira: true
  })

  const [jiraCommits, setJiraCommits] = useState<String[] | undefined[]>([])
  const [jirIssues, setJirIssues] = useState<Commit[] | undefined[]>([])
  const [redmineCommits, setRedmineCommits] = useState<String[] | undefined[]>([])
  const [redmineIssues, setRedmineIssues] = useState<Commit[] | undefined[]>([])
  const [branches, setBranches] = useState<String[]>(['dev', 'release', 'master'])

  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isRedmineLoading, setIsRedmineLoading] = useState(false)
  const [isJiraLoading, setIsJiraLoading] = useState(false)

  // restore option on mounted
  useEffect(() => {
    if (loadDataFromLocalStorage('option')) {
      setOption(loadDataFromLocalStorage('option'))
    }
    if (loadDataFromLocalStorage('applyStatus')) {
      setApplyStatus(loadDataFromLocalStorage('applyStatus'))
    }
    if (loadDataFromLocalStorage('branches')) {
      setBranches(loadDataFromLocalStorage('branches'))
    }
  }, [])

  useEffect(() => {
    if (redmineCommits.length > 0 && applyStatus.isFetchRedmine) {
      setIsRedmineLoading(true)
      Promise.all(redmineCommits.map(commit => fetchRedmineIssue(getRedmineId(`${commit}`))))
        .then(data => {
          const excludeStatusList = ['Close', 'On Production']
          const sortedData = data.sort((a, b) => a?.id - b?.id).filter(item => !excludeStatusList.some(status => status === item?.status))
          // @ts-ignore
          setRedmineIssues(sortedData)
          setIsRedmineLoading(false)
        })
    } else {
      setRedmineIssues([])
    }
  }, [redmineCommits])

  useEffect(() => {
    if (jiraCommits.length > 0 && applyStatus.isFetchJira) {
      setIsJiraLoading(true)
      Promise.all(jiraCommits.map(commit => fetchJiraIssue(getJiraId(`${commit}`))))
        .then(data => {
          const excludeStatusList = ['CLOSED']
          const sortedData = data.sort((a, b) => a?.id - b?.id).filter(item => !excludeStatusList.some(status => status === item?.status))
          // @ts-ignore
          setJirIssues(sortedData)
          setIsJiraLoading(false)
        })
    } else {
      setJirIssues([])
    }
  }, [jiraCommits])

  const jiraPattern: RegExp = /\[([a-zA-Z\s]+)-\d{4}\]/ // [OW-1234]
  const matchJiraPatternCommit = (commits:String[]) => {
    return commits.filter(commit => commit.match(jiraPattern))
  }
  const getJiraId = (commit: string) => {
    const match = commit.match(jiraPattern)
    if (match) {
      return `${match[0].match(/[a-zA-Z\s]+-\d{4}/gm)}`
    } else {
      return ''
    }
  }

  const redminePattern: RegExp = /\([a-z:]+ #\d{4}\)/ // done #1234
  const matchRedminePatternCommit = (commits:String[]) => {
    return commits.filter(commit => commit.match(redminePattern))
  }
  const getRedmineId = (commit: string) => {
    const match = commit.match(redminePattern)
    if (match) {
      return `${match[0].match(/\d{4}/gm)?.[0]}`
    } else {
      return ''
    }
  }

  const handleInput = (value:string, key:keyof Option) => {
    const updateOption = {...option}
    updateOption[key] = value
    setOption(updateOption)
  }

  const handleBranchChange = (value:string, key:keyof Branch) => {
    const updateBranch = {...branch}
    updateBranch[key] = value
    setBranch(updateBranch)
  }

  const handleFetchBranchDiff = async () => {
    saveDataToLocalStorage('option', option)
    saveDataToLocalStorage('applyStatus', applyStatus)
    try {
      setIsGithubLoading(true)
      const response = await fetch(
        `https://api.github.com/repos/${option.owner}/${option.repo}/compare/${branch.into}...${branch.from}`,
        {
          headers: {
            'Authorization': `Bearer ${option.githubToken}`
          }
        }
      )
      const res = await response.json()
      const list = res.commits.map((item: { commit: { message: any } }) => item.commit.message)

      setJiraCommits(matchJiraPatternCommit(list))
      setRedmineCommits(matchRedminePatternCommit(list))
      setIsGithubLoading(false)
    } catch (error) {
      console.error(ErrorEvent)
      setIsGithubLoading(false)
    }
  }

  async function fetchRedmineIssue(id:string | null | undefined) {
    const url = `${option.redminePath}/issues/${id}.json?key=${option.redmineToken}`
    try {
      const response = await fetch(url)
      const res = await response.json()
      const { id, subject, status } = res.issue
      return Promise.resolve({id, subject, status: status.name , markdown: `- ${subject} [redmine #${id}](${option.redminePath}/issues/${id})`})
    } catch (error) {
      console.error(ErrorEvent)
    }
  }

  async function fetchJiraIssue(id:string) {
    const url = `${option.jiraPath}/rest/api/latest/issue/${id}`
    const auth = Buffer.from(`${option.jiraAccount}:${option.jiraToken}`).toString('base64')
    try {
      const response = await fetch(
        url,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      )
      const { fields } = await response.json()
      const data = {
        id: fields.key,
        subject: fields.summary,
        status: fields.status.name,
        markdown: `- ${fields.summary} [${id}](${option.jiraPath}/browse/${id})`
      }
      return Promise.resolve(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleCopyRedmineIssues = () => {
    const copyContent = redmineIssues.map(issue => issue?.markdown).join('\r\n')
    clipboard.writeText(copyContent)
  }

  const handleCopyJiraIssues = () => {
    const copyContent = jirIssues.map(issue => issue?.markdown).join('\r\n')
    clipboard.writeText(copyContent)
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

  const handleApplyChange = (key: keyof ApplyStatus, value:boolean) => {
    const updateApplyStatus = {
      ...applyStatus
    }
    updateApplyStatus[key] = value
    setApplyStatus(updateApplyStatus)
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
    <main className="container mx-auto p-2">
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="icon tabs">
        <Tab icon={<AutoFixHighIcon />} aria-label="phone" />
        <Tab icon={<SettingsIcon />} aria-label="favorite" />
      </Tabs>
      <TabPanel value={activeTab} index={0}>
        <>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
            <GitHubIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <TextField
              label="OWNER"
              variant="standard"
              onInput={(e) => handleInput((e.target as HTMLInputElement).value, 'owner')}
              value={option.owner}
            />
            <div className="mx-2 text-gray-700" >/</div>
            <TextField
              label="REPO"
              variant="standard"
              onInput={(e) => handleInput((e.target as HTMLInputElement).value, 'repo')}
              value={option.repo}
              fullWidth
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
            <ForkRightIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <FormControl variant="standard" fullWidth>
              <InputLabel id="demo-simple-select-label">From</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={branch.from}
                label="From"
                onChange={(e:SelectChangeEvent) => handleBranchChange(e.target.value as string, 'from')}
              >
                {/* @ts-ignore */}
                { branches.map(item => (<MenuItem value={item} key={`from_${item}`}>{item}</MenuItem>)) }
              </Select>
            </FormControl>
            <ArrowRightAltIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <FormControl variant="standard" fullWidth>
              <InputLabel id="demo-simple-select-label">Into</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={branch.into}
                label="Into"
                onChange={(e:SelectChangeEvent) => handleBranchChange(e.target.value as string, 'into')}
              >
                {/* @ts-ignore */}
                { branches.map(item => (<MenuItem value={item} key={`into_${item}`}>{item}</MenuItem>)) }
              </Select>
            </FormControl>
          </Box>
          <Divider light />
          <Box sx={{ display: 'flex', alignItems: 'center', m: 2 }}>
            <Button
              variant="contained"
              onClick={handleFetchBranchDiff}
              disabled={isGithubLoading}
            >
              <AutoFixHighIcon sx={{ color: 'white' }} />
            </Button>
            {
              isGithubLoading && (<Box sx={{ display: 'flex' }}>
                <CircularProgress sx={{ ml:2, color:grey[900] }} size={30} />
              </Box>)
            }
            {
              isRedmineLoading && (<Box sx={{ display: 'flex' }}>
                <CircularProgress sx={{ ml:2, color:red[900] }} size={30} />
              </Box>)
            }
            {
              isJiraLoading && (<Box sx={{ display: 'flex' }}>
                <CircularProgress sx={{ ml:2, color:blue[900] }} size={30} />
              </Box>)
            }
          </Box>

          <IssueBlock
            title="Jira Issue"
            issues={jirIssues}
            handleCopyEvent={handleCopyJiraIssues}
          >
          </IssueBlock>
          <IssueBlock
            title="Redmine Issue"
            issues={redmineIssues}
            handleCopyEvent={handleCopyRedmineIssues}
          >
          </IssueBlock>
        </>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
            <KeyIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <TextField
              label="Github token"
              variant="standard"
              type="password"
              fullWidth
              onInput={(e) => handleInput((e.target as HTMLInputElement).value as string, 'githubToken')}
              value={option.githubToken}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', m: 2 }}>
            <ForkRightIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <BranchList
              branches={branches}
              handleDeleteBranchOption={handleDeleteBranchOption}
              handleAddBranchOption={handleAddBranchOption}
            >
            </BranchList>
          </Box>

          <Divider light />
          <Box sx={{ display: 'flex', alignItems: 'center', m: 2 }}>
            <h3 className="w-[24px] mr-[8px] text-white bg-slate-500 text-center rounded-md">R</h3>
            <div className="pl-2">
              <FormControlLabel
                  control={
                    <Switch
                      checked={applyStatus.isFetchRedmine}
                      onChange={(e) => handleApplyChange('isFetchRedmine', e.target.checked)}
                    />
                  }
                  label="Fetch Redmine"
                />
            </div>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
            <DnsIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <TextField
              label="Redmine path"
              variant="standard"
              fullWidth
              onInput={(e) => handleInput((e.target as HTMLInputElement).value as string, 'redminePath')}
              value={option.redminePath}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
            <KeyIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <TextField
              label="Redmine token"
              variant="standard"
              type="password"
              fullWidth
              onInput={(e) => handleInput((e.target as HTMLInputElement).value as string, 'redmineToken')}
              value={option.redmineToken}
            />
          </Box>
          <Divider light />
          <Box sx={{ display: 'flex', alignItems: 'center', m: 2 }}>
            <h3 className="w-[24px] mr-[8px] text-white bg-slate-500 text-center rounded-md">J</h3>
            <div className="pl-2">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={applyStatus.isFetchJira}
                      onChange={(e) => handleApplyChange('isFetchJira', e.target.checked)}
                    />
                  }
                  label="Fetch Jira"
                />
              </FormGroup>
            </div>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
            <DnsIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <TextField
              label="Jira path"
              variant="standard"
              fullWidth
              onInput={(e) => handleInput((e.target as HTMLInputElement).value as string, 'jiraPath')}
              value={option.jiraPath}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
            <KeyIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <TextField
              label="Jira account"
              variant="standard"
              onInput={(e) => handleInput((e.target as HTMLInputElement).value, 'jiraAccount')}
              value={option.jiraAccount}
              fullWidth
            />
            <div className="mx-2 text-gray-700" >/</div>
            <TextField
              label="Jira token"
              variant="standard"
              type="password"
              fullWidth
              onInput={(e) => handleInput((e.target as HTMLInputElement).value as string, 'jiraToken')}
              value={option.jiraToken}
            />
          </Box>
        </>
      </TabPanel>
    </main>
  )
}

export default App
