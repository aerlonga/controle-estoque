import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';
import { SitemarkIcon } from './components/LogoIcon';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

interface SignInProps {
  disableCustomTheme?: boolean;
}

export default function SignIn(props: SignInProps) {
  const { login } = useAuthStore();
  const [usuarioError, setUsuarioError] = React.useState(false);
  const [usuarioErrorMessage, setUsuarioErrorMessage] = React.useState('');
  const [senhaError, setSenhaError] = React.useState(false);
  const [senhaErrorMessage, setSenhaErrorMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const loginMutation = useMutation({
    mutationFn: ({ usuario_rede, senha }: { usuario_rede: string; senha: string }) =>
      authService.login(usuario_rede, senha),
    onSuccess: (data) => {
      login(data.usuario, data.token);
      setErrorMessage('');
    },
    onError: (error: any) => {
      setErrorMessage(
        error.response?.data?.error || 'Erro ao fazer login. Tente novamente.'
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const usuario_rede = data.get('usuario_rede') as string;
    const senha = data.get('senha') as string;

    loginMutation.mutate({ usuario_rede, senha });
  };

  const validateInputs = () => {
    const usuario = document.getElementById('usuario_rede') as HTMLInputElement;
    const senha = document.getElementById('senha') as HTMLInputElement;

    let isValid = true;

    if (!usuario.value || usuario.value.length < 3) {
      setUsuarioError(true);
      setUsuarioErrorMessage('Usuário deve ter no mínimo 3 caracteres.');
      isValid = false;
    } else {
      setUsuarioError(false);
      setUsuarioErrorMessage('');
    }

    if (!senha.value || senha.value.length < 1) {
      setSenhaError(true);
      setSenhaErrorMessage('Senha é obrigatória.');
      isValid = false;
    } else {
      setSenhaError(false);
      setSenhaErrorMessage('');
    }

    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Stack direction="row" sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
          <ColorModeIconDropdown />
        </Stack>
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Controle de Estoque
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="usuario_rede">Usuário de Rede</FormLabel>
              <TextField
                error={usuarioError}
                helperText={usuarioErrorMessage}
                id="usuario_rede"
                type="text"
                name="usuario_rede"
                placeholder="Digite seu usuário"
                autoComplete="username"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={usuarioError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="senha">Senha</FormLabel>
              <TextField
                error={senhaError}
                helperText={senhaErrorMessage}
                name="senha"
                placeholder="Digite sua senha"
                type={showPassword ? 'text' : 'password'}
                id="senha"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                color={senhaError ? 'error' : 'primary'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        size="small"
                        disableRipple
                        sx={{
                          color: 'text.secondary',
                          border: 'none',
                          backgroundColor: 'transparent',
                          width: 'auto',
                          height: 'auto',
                          padding: 0,
                          minWidth: 0,
                          '&:hover': {
                            backgroundColor: 'transparent',
                            border: 'none',
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
            {errorMessage && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {errorMessage}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
