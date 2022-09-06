import { useState, memo, KeyboardEvent } from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleIcon from '@mui/icons-material/AddCircle'
// import { EditableListProps } from '../interface'


const EditableList: React.FC = (props) => {
  const { label, list, handleDeleteItem, handleAddItem } = props
  const [newItem, setNewItem] = useState('')

  const handleEnter = (e: KeyboardEvent<HTMLImageElement>) => {
    if (e.key === 'Enter') {
      handleUpdateList()
    }
  }

  const handleUpdateList = () => {
    if (newItem) {
      handleAddItem(newItem)
      setNewItem('')
    }
  }

  return (
    <div className='-my-2'>
      <Box sx={{ display: 'flex', alignItems: 'flex-end'}}>
        <TextField
          label={`Add ${label} `}
          variant="standard"
          value={newItem}
          onInput={(e) => setNewItem((e.target as HTMLInputElement).value)}
          onKeyDown={handleEnter}
        />
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={handleUpdateList}
        >
          <AddCircleIcon />
        </IconButton>
      </Box>

      <List>
        {
          list.map((item, index) => (
            <ListItem
              disableGutters
              key={`option_${item}_${index}`}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteItem(item)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={item}
              />
            </ListItem>
          ))
        }
      </List>
    </div>
  )
}

export default memo(EditableList)
