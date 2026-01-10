import { useNavigate, useRouterState } from '@tanstack/react-router'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'

const mainListItems = [
  { text: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/' },
  { text: 'Equipamentos', icon: <BuildRoundedIcon />, path: '/equipments' },
  { text: 'Usuários', icon: <PeopleRoundedIcon />, path: '/users' },
]

export default function MenuContent() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={currentPath === item.path}
              onClick={() => navigate({ to: item.path })}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  )
}
