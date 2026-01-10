
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface ColorModeSelectProps {
    sx?: object;
    toggleColorMode?: () => void;
    mode?: 'light' | 'dark';
}

export default function ColorModeSelect({ sx, toggleColorMode, mode }: ColorModeSelectProps) {
    const handleToggle = () => {
        if (toggleColorMode) {
            toggleColorMode();
        }
    };

    return (
        <Box sx={sx}>
            <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
                <IconButton
                    onClick={handleToggle}
                    color="inherit"
                    aria-label="alternar modo de cor"
                    size="medium"
                >
                    {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
            </Tooltip>
        </Box>
    );
}
