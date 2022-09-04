import { memo } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import KeyIcon from '@mui/icons-material/Key'
import ForkRightIcon from '@mui/icons-material/ForkRight'
import DnsIcon from '@mui/icons-material/Dns'
import BranchList from './BranchList'
import { ErrorListProps } from '../interface'

const SettingPanel: React.FC = (props) => {
  const {
    option,
    applyStatus,
    branches,
    handleInput,
    handleDeleteBranchOption,
    handleAddBranchOption,
    handleApplyChange
  } = props
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
  )
}

export default memo(SettingPanel)
