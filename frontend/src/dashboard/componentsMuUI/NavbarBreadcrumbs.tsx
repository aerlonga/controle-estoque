import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { usePageTitle } from '../../contexts/PageTitleContext';

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
  '/': 'Home',
  '/users': 'Usuários',
  '/equipments': 'Equipamentos',
  '/dashboard-teste': 'Dashboard Teste',
};

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const { detailTitle, menuTitle } = usePageTitle();

  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate({ to: path });
  };

  if (pathnames.length === 0) {
    return (
      <StyledBreadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextRoundedIcon fontSize="small" />}
      >
        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
          Home
        </Typography>
        {menuTitle && menuTitle !== 'Dashboard' && (
          <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {menuTitle}
          </Typography>
        )}
      </StyledBreadcrumbs>
    );
  }

  const breadcrumbItems = [];

  breadcrumbItems.push(
    <Typography
      key="home"
      variant="body1"
      onClick={handleNavigate('/')}
      sx={{
        cursor: 'pointer',
        '&:hover': { textDecoration: 'underline' }
      }}
    >
      Home
    </Typography>
  );

  const firstSegment = pathnames[0];
  const firstPath = `/${firstSegment}`;
  const menuName = routeNameMap[firstPath] || firstSegment;
  if (pathnames.length === 1) {
    breadcrumbItems.push(
      <Typography
        key={firstPath}
        variant="body1"
        sx={{ color: 'text.primary', fontWeight: 600 }}
      >
        {menuName}
      </Typography>
    );
  } else {
    breadcrumbItems.push(
      <Typography
        key={firstPath}
        variant="body1"
        onClick={handleNavigate(firstPath)}
        sx={{
          color: 'text.secondary',
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' }
        }}
      >
        {menuName}
      </Typography>
    );

    const isEquipmentEdit = firstSegment === 'equipments' && pathnames.length === 3 && pathnames[2] === 'edit';
    const isEquipmentNew = firstSegment === 'equipments' && pathnames.length === 2 && pathnames[1] === 'new';

    if (isEquipmentEdit) {
      breadcrumbItems.push(
        <Typography
          key="edit"
          variant="body1"
          sx={{ color: 'text.primary', fontWeight: 600 }}
        >
          Editar equipamento
        </Typography>
      );
    } else if (isEquipmentNew) {
      breadcrumbItems.push(
        <Typography
          key="new"
          variant="body1"
          sx={{ color: 'text.primary', fontWeight: 600 }}
        >
          Cadastrar equipamento
        </Typography>
      );
    } else if (detailTitle) {
      breadcrumbItems.push(
        <Typography
          key="detail"
          variant="body1"
          sx={{ color: 'text.primary', fontWeight: 600 }}
        >
          {detailTitle}
        </Typography>
      );
    } else {
      for (let i = 1; i < pathnames.length; i++) {
        const value = pathnames[i];
        const to = `/${pathnames.slice(0, i + 1).join('/')}`;
        const isLast = i === pathnames.length - 1;
        const name = routeNameMap[to] || value;

        if (isLast) {
          breadcrumbItems.push(
            <Typography
              key={to}
              variant="body1"
              sx={{ color: 'text.primary', fontWeight: 600 }}
            >
              {name}
            </Typography>
          );
        } else {
          breadcrumbItems.push(
            <Typography
              key={to}
              variant="body1"
              onClick={handleNavigate(to)}
              sx={{
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {name}
            </Typography>
          );
        }
      }
    }
  }

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      {breadcrumbItems}
    </StyledBreadcrumbs>
  );
}
