import { memo } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { IssueBlockProps } from '../interface'

const IssueBlock: React.FC<IssueBlockProps> = (props) => {
  const { title, issues, handleCopyEvent } = props
  return (
    <Box sx={{ m: 2 }}>
      <h1 className='text-xl mb-2 mr-2'>
        {title}
        {/* @ts-ignore */}
        <Button variant="text" onClick={handleCopyEvent}>
          <ContentCopyIcon
            sx={{ color: 'action.active', mr: 1, my: 0.5 }}
          />
        </Button>
        { issues.map((issue, index) => (<p key={index} className='truncate text-base'>{issue?.markdown}</p>)) }
      </h1>
    </Box>
  )
}

export default memo(IssueBlock)
