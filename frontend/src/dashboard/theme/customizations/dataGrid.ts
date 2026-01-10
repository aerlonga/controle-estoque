import type { Theme, Components } from '@mui/material/styles';

export const dataGridCustomizations: Components<Theme> = {
    MuiDataGrid: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
                border: `1px solid ${theme.palette.divider}`,
                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                    outline: 'none',
                },
                '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                    outline: 'none',
                },
            }),
            columnHeaders: ({ theme }) => ({
                backgroundColor: theme.palette.background.default,
                borderBottom: `1px solid ${theme.palette.divider}`,
            }),
        },
    },
};
