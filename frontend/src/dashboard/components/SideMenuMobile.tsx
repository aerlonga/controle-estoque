import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
// import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
// import MenuButton from './MenuButton';
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../../store/authStore'
import MenuContent from './MenuContent';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          width: { xs: 'auto', md: 360 },
          maxWidth: { xs: '70dvw', md: '100%' },
          height: '100%',
        }}
      >Dashboard
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={(() => {
                const usuario = localStorage.getItem('usuario')
                return usuario ? JSON.parse(usuario).nome : 'Usuário'
              })()}
              sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}
            >
              {(() => {
                const usuario = localStorage.getItem('usuario')
                return usuario ? JSON.parse(usuario).nome?.charAt(0).toUpperCase() : 'U'
              })()}
            </Avatar>
            <Typography component="p" variant="h6">
              {(() => {
                const usuario = localStorage.getItem('usuario')
                return usuario ? JSON.parse(usuario).nome : 'Usuário'
              })()}
            </Typography>
          </Stack>
          {/* <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton> */}
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <Stack sx={{ p: 2 }}>
          <Button variant="outlined" fullWidth startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
