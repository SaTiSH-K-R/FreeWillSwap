import { Dialog, DialogTitle, Divider, List, ListItem, ListItemButton, ListItemText } from "@mui/material"
import PropTypes from 'prop-types'
import { FUSD_ADDRESS, FWT_ADDRESS } from "../constants";

SelectTokenDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.object.isRequired,
  alreadySelected: PropTypes.object.isRequired
}

export function SelectTokenDialog(props) {
  const { onClose, selectedValue, open, alreadySelected } = props;

  const tokens = [
    {
      name: 'Ether',
      symbol: 'ETH',
      address: 'ETH'
    },
    {
      name: 'FreeWill USD',
      symbol: 'FUSD',
      address: FUSD_ADDRESS
    },
    {
      name: 'FreeWill Token',
      symbol: 'FWT',
      address: FWT_ADDRESS
    }
  ]

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <Dialog 
      onClose={handleClose} 
      open={open}
      PaperProps={{ style: { borderRadius: 20 } }}
    >
      <DialogTitle>Select a Token</DialogTitle>
      <Divider orientation="horizontal" />
      <List sx={{ pt: 0 }}>
        {tokens.map((token) => (
          <ListItemButton
            disabled={token.address === alreadySelected.address ? true : false}
            onClick={() => handleListItemClick(token)} key={token.address}
          >
            <ListItemText
              primary={token.name}
              secondary={token.symbol}
            ></ListItemText>
          </ListItemButton>
        ))}
      </List>
    </Dialog>
  )
}

