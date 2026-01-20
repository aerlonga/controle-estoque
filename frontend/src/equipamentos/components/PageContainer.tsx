'use client';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container, { ContainerProps } from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { usePageTitle } from '../../contexts/PageTitleContext';

const PageContentHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

const PageHeaderToolbar = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(1),
  marginLeft: 'auto',
}));

export interface PageContainerProps extends ContainerProps {
  children?: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  fullWidth?: boolean;
}

export default function PageContainer(props: PageContainerProps) {
  const { children, title, actions = null } = props;
  const { fullWidth = false } = props;
  const { setDetailTitle } = usePageTitle();

  React.useEffect(() => {
    if (title) {
      setDetailTitle(title);
    }
  }, [title, setDetailTitle]);

  return (
    <Container
      maxWidth={fullWidth ? false : 'lg'}
      sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: fullWidth ? 3 : undefined }}
    >
      <Stack sx={{ flex: 1, my: 2 }} spacing={2}>
        <Stack>
          <PageContentHeader>
            {title ? <Typography variant="h4">{title}</Typography> : null}
            <PageHeaderToolbar>{actions}</PageHeaderToolbar>
          </PageContentHeader>
        </Stack>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Stack>
    </Container>
  );
}
