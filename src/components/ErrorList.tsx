import { memo } from 'react'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ErrorListProps } from '../interface'

const ErrorList: React.FC<ErrorListProps> = (props) => {
  const { errors } = props
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  if (errors.length > 0) {
    return (
      <Box sx={{ m: 2 }}>
        {errors.map((error) => (
          <Stack sx={{ width: '100%' }} spacing={2} key={`error_${error}`}>
            <Alert
              variant={isDarkMode ? 'outlined' : 'standard'} severity="error"
            >
              <AlertTitle>Error</AlertTitle>
              <strong>{error}</strong>
            </Alert>
          </Stack>
        ))}

      </Box>
    )
  }
  return null
}

export default memo(ErrorList)
