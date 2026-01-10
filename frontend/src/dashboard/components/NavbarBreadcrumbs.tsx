import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation } from '@tanstack/react-router';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

const routeNameMap: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Usuários',
  '/equipments': 'Equipamentos',
  '/dashboard-teste': 'Dashboard Teste',
};

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">Dashboard</Typography>
      {pathnames.length > 0 ? (
        pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const name = routeNameMap[to] || value; // Fallback to path segment if not mapped

          return (
            <Typography
              key={to}
              variant="body1"
              sx={{ color: last ? 'text.primary' : 'text.secondary', fontWeight: last ? 600 : 400 }}
            >
              {name}
            </Typography>
          );
        })
      ) : (
        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
          Home
        </Typography>
      )}
    </StyledBreadcrumbs>
  );
}
