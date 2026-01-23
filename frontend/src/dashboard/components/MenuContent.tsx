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
  { text: 'Usuários', icon: <PeopleRoundedIcon />, path: '/users', adminOnly: true },
]

export default function MenuContent() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const isAdmin = (() => {
    const usuario = localStorage.getItem('usuario')
    if (!usuario) return false
    try {
      const parsed = JSON.parse(usuario)
      return parsed.perfil === 'ADMIN'
    } catch {
      return false
    }
  })()

  // Filter menu items based on user permissions
  const filteredMenuItems = mainListItems.filter(item => {
    if (item.adminOnly) {
      return isAdmin
    }
    return true
  })

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {filteredMenuItems.map((item, index) => (
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
