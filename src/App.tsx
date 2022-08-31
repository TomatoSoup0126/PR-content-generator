import { useState } from 'react'
import vite from '/vite.svg'
import styles from 'styles/app.module.scss'
import Button from '@mui/material/Button';

const App: React.FC = () => {
  const [count, setCount] = useState(0)

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <h1 className="text-3xl font-bold underline">
          Hello world!
        </h1>
      </header>
    </div>
  )
}

export default App
