import { useState, memo } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { IssueBlockProps } from '../interface'

const IssueBlock: React.FC<IssueBlockProps> = (props) => {
  const { title, issues, handleCopyEvent, handleSetShowClosedIssue, showClosedIssue,  content } = props

  return (
    <Box sx={{ m: 2 }}>
      <h1 className='text-xl mr-2'>
        {title}
        {/* @ts-ignore */}
        <Button variant="text" onClick={handleCopyEvent}>
          <ContentCopyIcon
            sx={{ color: 'action.active', mr: 1, my: 0.5 }}
          />
        </Button>
      </h1>
      <Box>
        {
          !content &&
          <FormControlLabel
            control={
              <Switch
                checked={showClosedIssue}
                onChange={(e) => handleSetShowClosedIssue(e.target.checked)}
              />
            }
            label="Show closed issue"
          />
        }
      </Box>
      { issues.map((issue, index) => (<p key={index} className='truncate text-base'>{issue?.markdown}</p>)) }
      { content && (<p className="text-base">{content}</p>) }
    </Box>
  )
}

export default memo(IssueBlock)
