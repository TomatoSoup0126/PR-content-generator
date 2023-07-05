import { useState, useEffect, useMemo,memo } from 'react'
import {
  Commit,
  Issue,
  ActionPanelProps,
  ActionRestoreList
} from '../interface'

import { useTheme } from '@mui/material/styles'

import { grey, red, blue } from '@mui/material/colors';
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

import GitHubIcon from '@mui/icons-material/GitHub'
import ForkRightIcon from '@mui/icons-material/ForkRight'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'

import ErrorList from './ErrorList'
import IssueBlock from './IssueBlock'

import { clipboard } from 'electron'

const ActionPanel: React.FC<ActionPanelProps> = (props) => {
  const {
    option,
    branches,
    repos,
    loadDataFromLocalStorage,
    saveDataToLocalStorage
  } = props

  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'

  const [owner, setOwner] = useState('')
  const [repoName, setRepoName] = useState('')
  const [branchFrom, setBranchFrom] = useState('')
  const [branchInto, setBranchInto] = useState('')
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isRedmineLoading, setIsRedmineLoading] = useState(false)
  const [isJiraLoading, setIsJiraLoading] = useState(false)

  const [errors, setErrors] = useState<String[] | undefined[]>([])
  const [jiraCommits, setJiraCommits] = useState<String[] | undefined[]>([])
  const [jirIssues, setJirIssues] = useState<Commit[] | undefined[]>([])
  const [redmineCommits, setRedmineCommits] = useState<String[] | undefined[]>([])
  const [redmineIssues, setRedmineIssues] = useState<Commit[] | undefined[]>([])

  const [isShowClosedIssueOnJira, setIsShowClosedIssueOnJira] = useState(true)
  const [isShowClosedIssueOnRedmine, setIsShowClosedIssueOnRedmine] = useState(true)

  const filteredJiraIssues = useMemo(() => {
    if (isShowClosedIssueOnJira) {
      return jirIssues
    }
    // @ts-ignore
    return jirIssues.filter((issue: { status: string } ) => {
      return !['Closed'].some(closeTag => issue?.status === closeTag)
    })
  }, [isShowClosedIssueOnJira, jirIssues])

  const filteredRedmineIssues = useMemo(() => {
    if (isShowClosedIssueOnRedmine) {
      return redmineIssues
    }
    // @ts-ignore
    return redmineIssues.filter((issue: { status: string }) => {
      return !['Close', 'On Production'].some(closeTag => issue?.status === closeTag)
    })
  }, [isShowClosedIssueOnRedmine, redmineIssues])

  const handleCopyRedmineIssues = () => {
    const copyContent = filteredRedmineIssues.map((issue: { markdown: string }) => issue?.markdown).join('\r\n')
    writeToClipboard(copyContent)
  }

  const handleCopyJiraIssues = () => {
    const copyContent = filteredJiraIssues.map((issue: { markdown: string }) => issue?.markdown).join('\r\n')
    writeToClipboard(copyContent)
  }

  const writeToClipboard = (content: string) => {
    clipboard.writeText(content)
  }

  const restoreList: ActionRestoreList = {
    owner: {
      data: owner,
      setter: setOwner
    },
    repoName: {
      data: repoName,
      setter: setRepoName
    },
    branchFrom: {
      data: branchFrom,
      setter: setBranchFrom
    },
    branchInto: {
      data: branchInto,
      setter: setBranchInto
    }
  }

  const saveOptionsToStorage = () => {
    Object.keys(restoreList).forEach(key => {
      saveDataToLocalStorage(key, restoreList[key].data)
    })
  }

  const handleFetchBranchDiff = async () => {
    saveOptionsToStorage()
    setJiraCommits([])
    setRedmineCommits([])
    setErrors([])
    try {
      setIsGithubLoading(true)
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/compare/${branchInto}...${branchFrom}`,
        {
          headers: {
            'Authorization': `Bearer ${option.githubToken}`
          }
        }
      )

      const res = await response.json()

      let list = []
      if (res.commits) {
        list = res.commits.map((item: { commit: { message: any } }) => item.commit.message)
      } else {
        console.debug(res)
        setErrors([`${response.status} ${res.message} (Github)`])
      }

      setJiraCommits(matchJiraPatternCommit(list))
      setRedmineCommits(matchRedminePatternCommit(list))
    } catch (error) {
      console.error(error)
    } finally {
      setIsGithubLoading(false)
    }
  }

  async function fetchRedmineIssue(id:string | null | undefined) {
    if (id) {
      const url = `${option.redminePath}/issues/${id}.json?key=${option.redmineToken}`
      try {
        const response = await fetch(url)
        const res = await response.json()
        const { id, subject, status } = res.issue
        const data: Issue = {
          id,
          subject,
          status: status.name,
          markdown: `- ${subject} [redmine #${id}](${option.redminePath}/issues/${id})`
        }
        return Promise.resolve(data)
      } catch (error) {
        console.error(error)
        // @ts-ignore
        const updateErrors:String[] = [...errors, 'Redmine fetch error']
        setErrors(updateErrors)
      }
    }
  }

  async function fetchJiraIssue(id:string | null | undefined) {
    if (id) {
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
        const data: Issue = {
          id,
          subject: fields.summary,
          status: fields.status.name,
          markdown: `- ${fields.summary} [${id}](${option.jiraPath}/browse/${id})`
        }
        return Promise.resolve(data)
      } catch (error) {
        console.error(error)
        // @ts-ignore
        const updateErrors:String[] = [...errors, 'Jira fetch error']
        setErrors(updateErrors)
      }
    }
  }

  useEffect(() => {
    Object.keys(restoreList).forEach(key => {
      const restoreData = loadDataFromLocalStorage(key)
      if (restoreData) {
        restoreList[key].setter(restoreData)
      }
    })
  }, [])

  useEffect(() => {
    if (redmineCommits.length > 0 && option.isFetchRedmine) {
      setIsRedmineLoading(true)
      const commitIdGroups = redmineCommits.map(commit => getRedmineIds(`${commit}`))
      const uniqueCommitIds = Array.from(new Set(commitIdGroups.flat()))
      Promise.all(uniqueCommitIds.map(id => fetchRedmineIssue(id)))
        .then(data => {
          const sortedData = data.sort((a, b) => Number(a?.id) - Number(b?.id))
          // @ts-ignore
          setRedmineIssues(sortedData)
          setIsRedmineLoading(false)
        })
    } else {
      setRedmineIssues([])
    }
  }, [redmineCommits])

  useEffect(() => {
    if (jiraCommits.length > 0 && option.isFetchJira) {
      setIsJiraLoading(true)
      const commitIdGroups = jiraCommits.map(commit => getJiraIds(`${commit}`))
      const uniqueCommitIds = Array.from(new Set(commitIdGroups.flat()))
      Promise.all(uniqueCommitIds.map(id => fetchJiraIssue(id)))
        .then(data => {
          const sortedData = data.sort((a, b) => Number(a?.id) - Number(b?.id))
          // @ts-ignore
          setJirIssues(sortedData)
          setIsJiraLoading(false)
        })
    } else {
      setJirIssues([])
    }
  }, [jiraCommits])

  const redmineTagMap: {[index: string]:any} = {
    dev: 'done',
    staging: 'done',
    release: 'release',
    master: 'production'
  }

  const title = useMemo(() => {
    let jiraIdInTitle = ''
    let redmineIdsInTitle = ''
    if (option.isFetchJira && filteredJiraIssues.length > 0) {
      const jiraIds = filteredJiraIssues.map((issue: { id: string }) => `[${issue?.id}]`)
      jiraIdInTitle = jiraIds.join('')
    }
    if (option.isFetchRedmine && filteredRedmineIssues.length > 0) {
      const redmineIds = filteredRedmineIssues.map((issue: { id: string }) => `#${issue?.id}`)
      const redmineTag = redmineTagMap[branchInto] || ''
      redmineIdsInTitle = `(${redmineTag} ${redmineIds.join(', ')})`
    }
    if (branchFrom && branchInto) {
      return `[${branchInto}]${jiraIdInTitle} update from ${branchFrom} ${redmineIdsInTitle}`
    }
    return ''
  }, [branchFrom, branchInto, filteredJiraIssues, filteredRedmineIssues])

  const jiraPattern: RegExp = /\[([a-zA-Z\s]+)-\d+\]/ // [OW-1234]
  const matchJiraPatternCommit = (commits:String[]) => {
    return commits.filter(commit => commit.match(jiraPattern))
  }
  const getJiraIds = (commit: string) => {
    const match = commit.match(jiraPattern)
    if (match) {
      return match[0].match(/[a-zA-Z\s]+-\d+/gm)
    } else {
      return []
    }
  }

  const redminePattern: RegExp = /\([a-z:]+((\s|,)*#+\d+)+\)/ // done #1234
  const matchRedminePatternCommit = (commits:String[]) => {
    return commits.filter(commit => commit.match(redminePattern))
  }
  const getRedmineIds = (commit: string) => {
    const match = commit.match(redminePattern)
    if (match) {
      return match[0].match(/\d+/gm)
    } else {
      return []
    }
  }

  const circularProgressList = [
    {
      key: 'githubCircularProgress',
      loading: isGithubLoading,
      color: () => isDarkMode ? grey[200] : grey[900],
      title: 'Github'
    },
    {
      key: 'redmineCircularProgress',
      loading: isRedmineLoading,
      color: () => isDarkMode ? red[200] : red[900],
      title: 'Redmine'
    },
    {
      key: 'jiraCircularProgress',
      loading: isJiraLoading,
      color: () =>isDarkMode ? blue[200] : blue[900],
      title: 'Jira'
    }
  ]

  const resultBlockList = [
    {
      title: 'PR Title',
      displayRole: title,
      issues: [],
      content: title,
      handleCopyEvent: () => writeToClipboard(title)
    },
    {
      title: 'Jira Issue',
      displayRole: !isJiraLoading && jirIssues.length > 0,
      issues: filteredJiraIssues,
      content: '',
      handleCopyEvent: handleCopyJiraIssues,
      handleSetShowClosedIssue: setIsShowClosedIssueOnJira,
      showClosedIssue: isShowClosedIssueOnJira
    },
    {
      title: 'Redmine Issue',
      displayRole: !isRedmineLoading && redmineIssues.length > 0,
      issues: filteredRedmineIssues,
      content: '',
      handleCopyEvent: handleCopyRedmineIssues,
      handleSetShowClosedIssue: setIsShowClosedIssueOnRedmine,
      showClosedIssue: isShowClosedIssueOnRedmine
    },
  ]

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
        <GitHubIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
        <TextField
          label="OWNER"
          variant="standard"
          onInput={(e) => setOwner((e.target as HTMLInputElement).value)}
          value={owner}
        />
        <div className="mx-2 text-gray-700" >/</div>
        <FormControl variant="standard" fullWidth>
          <InputLabel id="repo-select-label">REPO</InputLabel>
          <Select
            labelId="repo-select-label"
            id="demo-simple-select"
            value={repoName}
            label="From"
            onChange={(e:SelectChangeEvent) => setRepoName(e.target.value as string)}
          >
            {/* @ts-ignore */}
            { repos.map(item => (<MenuItem value={item} key={`repo_${item}`}>{item}</MenuItem>)) }
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
        <ForkRightIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
        <FormControl variant="standard" fullWidth>
          <InputLabel id="demo-simple-select-label">From</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={branchFrom}
            label="From"
            onChange={(e:SelectChangeEvent) => setBranchFrom(e.target.value as string)}
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
            value={branchInto}
            label="Into"
            onChange={(e:SelectChangeEvent) => setBranchInto(e.target.value as string)}
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
          <AutoFixHighIcon />
        </Button>
        {
          circularProgressList.map(circularProgress => circularProgress.loading && (
            <Box
              sx={{ display: 'flex', alignItems: 'center' }}
              key={circularProgress.key}
            >
              <CircularProgress
                sx={{ ml:2, color: circularProgress.color }}
                size={30}
              />
              <Box sx={{ marginLeft: '16px' }}>
                { circularProgress.title }
              </Box>
            </Box>
          ))
        }
      </Box>
      <ErrorList errors={errors} children={null} />
      {
        resultBlockList.map(resultBlock => {
          return resultBlock.displayRole && (
            <IssueBlock
              key={resultBlock.title}
              title={resultBlock.title}
              issues={resultBlock.issues}
              content={resultBlock.content}
              handleCopyEvent={resultBlock.handleCopyEvent}
              handleSetShowClosedIssue={resultBlock.handleSetShowClosedIssue}
              showClosedIssue={resultBlock.showClosedIssue}
            >
            </IssueBlock>
          )
        })
      }
    </>
  )
}

export default memo(ActionPanel)
