import Header from "../components/header"
import { useState } from "react"
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { Liquidity } from "../components/liquidity"
import { Swap } from "../components/swap"
import { Stack } from "@mui/material"

export default function Home() {

  const [action, setAction] = useState('swap')
  const [account, setAccount] = useState('')

  const changeAction = (e, newAction) => {
    setAction(newAction)
  }

  const _setAccount = (_account) => {
    setAccount(_account)
  }
  
  return (
    <div>
      <Header _setAccount={_setAccount}/>
      <Stack
        mt={4}
        direction="column"
        alignItems="center"
        spacing={3}
      >
        <ToggleButtonGroup
          size="small"
          color="primary"
          value={action}
          exclusive
          onChange={changeAction}
        >
          <ToggleButton value="swap">Swap</ToggleButton>
          <ToggleButton value="liquidity">Liquidity</ToggleButton>
        </ToggleButtonGroup>
        {
          action === 'liquidity'
          ? 
            <Liquidity />
          :
            <Swap account={account}/>
        }
        

      </Stack>
    </div>
  )
}
