import { useState } from 'react'
import Box from '@mui/material/Box'
import GitHubIcon from '@mui/icons-material/GitHub'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import KeyIcon from '@mui/icons-material/Key'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button'

const App: React.FC = () => {
  const [path, setPath] = useState({
    owner: '',
    repo: '',
    githubToken: ''
  })

  const [branch, setBranch] = useState({
    into: 'release',
    from: 'dev'
  })

  const option = ['dev', 'release', 'master']

  const handleInput = (value:String, key:String) => {
    const updatePath = {...path}
    updatePath[key] = value
    setPath(updatePath)
  }

  const handleBranchChange = (value:String, key:String) => {
    const updateBranch = {...branch}
    updateBranch[key] = value
    setBranch(updateBranch)
  }

  const handleFetchBranchDiff = async () => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${path.owner}/${path.repo}/compare/${branch.into}...${branch.from}`,
        {
          headers: {
            'Authorization': `Bearer ${path.githubToken}`
          }
        }
      )
      const res = await response.json()
      const list = res.commits.map(item => item.commit.message)
      console.log(list)
    } catch (error) {

    }
  }

  return (
    <main className="container mx-auto p-2">
      <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
        <GitHubIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
        <TextField
          label="OWNER"
          variant="standard"
          onInput={(e) => handleInput(e.target.value, 'owner')}
          value={path.owner}
        />
        <div className="mx-2 text-gray-700" >/</div>
        <TextField
          label="REPO"
          variant="standard"
          onInput={(e) => handleInput(e.target.value, 'repo')}
          value={path.repo}
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
            onChange={(e:SelectChangeEvent) => handleBranchChange(e.target.value, 'from')}
          >
            { option.map(item => (<MenuItem value={item} key={`from_${item}`}>{item}</MenuItem>)) }

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
            onChange={(e:SelectChangeEvent) => handleBranchChange(e.target.value as String, 'into')}
          >
            { option.map(item => (<MenuItem value={item} key={`into_${item}`}>{item}</MenuItem>)) }

          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
        <KeyIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
        <TextField
          label="github token"
          variant="standard"
          fullWidth
          onInput={(e) => handleInput(e.target.value as String, 'githubToken')}
          value={path.githubToken}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
        <Button variant="contained" onClick={handleFetchBranchDiff} >Fetch!</Button>
      </Box>
    </main>
  )
}

export default App
