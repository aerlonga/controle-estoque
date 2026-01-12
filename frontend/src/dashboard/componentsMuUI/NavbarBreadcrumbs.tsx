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

  // Se estamos na home (sem pathnames)
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

  // Construir breadcrumbs de forma inteligente
  const breadcrumbItems = [];

  // Sempre começa com Home (clicável)
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

  // Pega o primeiro segmento (geralmente o menu principal)
  const firstSegment = pathnames[0];
  const firstPath = `/${firstSegment}`;
  const menuName = routeNameMap[firstPath] || firstSegment;

  // Se temos apenas 1 segmento, é a página de lista/menu
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
    // Temos mais de 1 segmento (ex: /equipments/348 ou /equipments/348/edit)
    // Menu principal é clicável
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

    // Se há um detailTitle definido, usar ele como último item
    // Isso substitui TODOS os segmentos intermediários (IDs, etc)
    if (detailTitle) {
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
      // Se não há detailTitle, mostrar os segmentos restantes
      // (isso pode acontecer durante o carregamento)
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
