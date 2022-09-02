import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import GitHubIcon from '@mui/icons-material/GitHub'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import ForkRightIcon from '@mui/icons-material/ForkRight'
import KeyIcon from '@mui/icons-material/Key'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'

import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import { clipboard } from 'electron'

interface LoadingStatus {
  showResultBlock: String
  isGithubLoading: String
  isRedmineLoading: String
  isJiraLoading: String
}

interface Option {
  owner: String
  repo: String
  githubToken: String
  redmineToken: String
  redminePath: String
  jiraAccount: String
  jiraToken: String
  jiraPath: String
}

interface Branch {
  into: String
  from: String
}

interface Commit {
  id: any
  subject: any
  status: any
  markdown: String
}

const App: React.FC = () => {
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
    into: 'release',
    from: 'dev'
  })

  const [jiraCommits, setJiraCommits] = useState<String[] | undefined[]>([])
  const [jirIssues, setJirIssues] = useState<Commit[] | undefined[]>([])
  const [redmineCommits, setRedmineCommits] = useState<String[] | undefined[]>([])
  const [redmineIssues, setRedmineIssues] = useState<Commit[] | undefined[]>([])

  const [loadingStatus, setloadingStatus] = useState({
    showResultBlock: true,
    isGithubLoading: false,
    isRedmineLoading: false,
    isJiraLoading: false
  })

  const changeLoadingStatus = (key: keyof LoadingStatus, value:boolean) => {
    const updateLoadingStatus = {
      ...loadingStatus
    }
    updateLoadingStatus[key] = value
    setloadingStatus(updateLoadingStatus)
  }

  // restore option on mounted
  useEffect(() => {
    if (loadDataFromLocalStorage('option')) {
      setOption(loadDataFromLocalStorage('option'))
    }
  }, [])

  useEffect(() => {
    if (redmineCommits.length > 0) {
      changeLoadingStatus('isRedmineLoading', true)
      Promise.all(redmineCommits.map(commit => fetchRedmineIssue(getRedmineId(`${commit}`))))
        .then(data => {
          const excludeStatusList = ['Close', 'On Production']
          const sortedData = data.sort((a, b) => a?.id - b?.id).filter(item => !excludeStatusList.some(status => status === item?.status))
          // @ts-ignore
          setRedmineIssues(sortedData)
          changeLoadingStatus('isRedmineLoading', false)
        })
    } else {
      setRedmineIssues([])
    }
  }, [redmineCommits])

  useEffect(() => {
    if (jiraCommits.length > 0) {
      changeLoadingStatus('isJiraLoading', true)
      Promise.all(jiraCommits.map(commit => fetchJiraIssue(getJiraId(`${commit}`))))
        .then(data => {
          const excludeStatusList = ['CLOSED']
          const sortedData = data.sort((a, b) => a?.id - b?.id).filter(item => !excludeStatusList.some(status => status === item?.status))
          // @ts-ignore
          setJirIssues(sortedData)
          changeLoadingStatus('isJiraLoading', false)
        })
    } else {
      setJirIssues([])
    }
  }, [jiraCommits])

  const branchOption = ['dev', 'release', 'master']

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
    try {
      changeLoadingStatus('isGithubLoading', true)
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
      changeLoadingStatus('isGithubLoading', false)
      setJiraCommits(matchJiraPatternCommit(list))
      setRedmineCommits(matchRedminePatternCommit(list))
    } catch (error) {
      console.error(ErrorEvent)
      changeLoadingStatus('isGithubLoading', false)
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

  const LoadingBar = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    )
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

  const JiraIssuesBlock = () => {
    return loadingStatus.isJiraLoading ? (
      <LoadingBar />
    ) : (
      jirIssues.map((issue, index) => (<p key={index} className='truncate'>{issue?.markdown}</p>))
    )
  }

  const RedmineIssuesBlock = () => {
    return loadingStatus.isRedmineLoading ? (
      <LoadingBar />
    ) : (
      redmineIssues.map((issue, index) => (<p key={index} className='truncate'>{issue?.markdown}</p>))
    )
  }

  return (
    <main className="container mx-auto p-2">
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
            { branchOption.map(item => (<MenuItem value={item} key={`from_${item}`}>{item}</MenuItem>)) }

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
            { branchOption.map(item => (<MenuItem value={item} key={`into_${item}`}>{item}</MenuItem>)) }

          </Select>
        </FormControl>
      </Box>
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
      <Divider light />
      <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
        <h3 className="w-[24px] mr-[8px] text-white bg-slate-500 text-center rounded-md">R</h3>
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
      <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
        <h3 className="w-[24px] mr-[8px] text-white bg-slate-500 text-center rounded-md">J</h3>
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
      <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
        <Button variant="contained" onClick={handleFetchBranchDiff} disabled={loadingStatus.isGithubLoading}>
          <AutoFixHighIcon sx={{ color: 'white' }} />
        </Button>
      </Box>
      <Box sx={{ m: 2 }}>
        <h1 className='text-xl mb-2 mr-2'>
          Jira Issue
          <Button variant="text">
            <ContentCopyIcon
              sx={{ color: 'action.active', mr: 1, my: 0.5 }}
              onClick={handleCopyJiraIssues}
            />
          </Button>
        </h1>
        {/* @ts-ignore */}
        <JiraIssuesBlock />
      </Box>
      <Divider light />
      <Box sx={{ m: 2 }}>
        <h1 className='text-xl mb-2 mr-2'>
          Redmine Issue
          <Button variant="text">
            <ContentCopyIcon
              sx={{ color: 'action.active', mr: 1, my: 0.5 }}
              onClick={handleCopyRedmineIssues}
            />
          </Button>
        </h1>
        {/* @ts-ignore */}
        <RedmineIssuesBlock />
      </Box>
    </main>
  )
}

export default App
