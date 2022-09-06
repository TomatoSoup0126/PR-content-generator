import { useState, memo } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import SpeedDial from '@mui/material/SpeedDial'
import Switch from '@mui/material/Switch'
import KeyIcon from '@mui/icons-material/Key'
import ForkRightIcon from '@mui/icons-material/ForkRight'
import DnsIcon from '@mui/icons-material/Dns'
import SaveIcon from '@mui/icons-material/Save'
import BranchList from './BranchList'
import EditableList from './EditableList'
import { SettingPanelProps, Option } from '../interface'

const SettingPanel: React.FC<SettingPanelProps> = (props) => {
  const {
    option,
    branches,
    handleUpdateOption,
    handleDeleteBranchOption,
    handleAddBranchOption,
  } = props

  const [childOption, setChildOption] = useState({
    owner: '',
    repo: '',
    githubToken: '',
    redmineToken: '',
    redminePath: '',
    isFetchRedmine: true,
    jiraAccount: '',
    jiraToken: '',
    jiraPath: '',
    isFetchJira: true,
    ...option
  })

  const handleInput:Function = (value: string & boolean, key:keyof Option) => {
    const updateOption = {
      ...option,
      ...childOption
    }
    updateOption[key] = value
    setChildOption({...updateOption})
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
        <KeyIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
        <TextField
          label="Github token"
          variant="standard"
          type="password"
          fullWidth
          onInput={(e) => handleInput((e.target as HTMLInputElement).value as string, 'githubToken')}
          value={childOption.githubToken}
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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', m: 2 }}>
        <ForkRightIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
        <EditableList
          list={branches}
          handleDeleteItem={handleDeleteBranchOption}
          handleAddItem={handleAddBranchOption}
        >
        </EditableList>
      </Box>

      <Divider light />
      <Box sx={{ display: 'flex', alignItems: 'center', m: 2 }}>
        <h3 className="w-[24px] mr-[8px] text-white bg-slate-500 text-center rounded-md">R</h3>
        <div className="pl-2">
          <FormControlLabel
              control={
                <Switch
                  checked={childOption.isFetchRedmine ?? true}
                  onChange={(e) => handleInput(e.target.checked, 'isFetchRedmine')}
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
          value={childOption.redminePath}
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
          value={childOption.redmineToken}
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
                  checked={childOption.isFetchJira ?? true}
                  onChange={(e) => handleInput(e.target.checked, 'isFetchJira')}
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
          value={childOption.jiraPath}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 2 }}>
        <KeyIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
        <TextField
          label="Jira account"
          variant="standard"
          onInput={(e) => handleInput((e.target as HTMLInputElement).value, 'jiraAccount')}
          value={childOption.jiraAccount}
          fullWidth
        />
        <div className="mx-2 text-gray-700" >/</div>
        <TextField
          label="Jira token"
          variant="standard"
          type="password"
          fullWidth
          onInput={(e) => handleInput((e.target as HTMLInputElement).value as string, 'jiraToken')}
          value={childOption.jiraToken}
        />
      </Box>
      <Box sx={{ height: 64 }} />
      <SpeedDial
        ariaLabel="save"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SaveIcon />}
        onClick={() => handleUpdateOption(childOption)}
      >
      </SpeedDial>
    </>
  )
}

export default memo(SettingPanel)
