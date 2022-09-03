import { useState, memo, KeyboardEvent } from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { BranchListProps } from '../interface'


const BranchList: React.FC<BranchListProps> = (props) => {
  const { branches, handleDeleteBranchOption, handleAddBranchOption } = props
  const [newBranch, setNewBranch] = useState('')

  const handleEnter = (e: KeyboardEvent<HTMLImageElement>) => {
    if (e.key === 'Enter') {
      handleUpdateOption()
    }
  }

  const handleUpdateOption = () => {
    if (newBranch) {
      handleAddBranchOption(newBranch)
      setNewBranch('')
    }
  }

  return (
    <div className='-my-2'>
      <Box sx={{ display: 'flex', alignItems: 'flex-end'}}>
        <TextField
          label="Add branch"
          variant="standard"
          value={newBranch}
          onInput={(e) => setNewBranch((e.target as HTMLInputElement).value)}
          onKeyDown={handleEnter}
        />
        <IconButton edge="end" aria-label="delete">
          <AddCircleIcon  onClick={handleUpdateOption} />
        </IconButton>
      </Box>

      <List>
        {
          branches.map(branch => (
            <ListItem
              disableGutters
              key={`option_${branch}`}
              secondaryAction={
                <IconButton edge="end" aria-label="delete">
                  <DeleteIcon onClick={() => handleDeleteBranchOption(branch)} />
                </IconButton>
              }
            >
              <ListItemText
                primary={branch}
              />
            </ListItem>
          ))
        }
      </List>
    </div>
  )
}

export default memo(BranchList)
