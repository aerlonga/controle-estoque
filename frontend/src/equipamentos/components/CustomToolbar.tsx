import * as React from 'react';
import {
    Toolbar,
    ToolbarButton,
    ColumnsPanelTrigger,
    FilterPanelTrigger,
    ExportPrint,
} from '@mui/x-data-grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

declare module '@mui/x-data-grid' {
    interface ToolbarPropsOverrides {
        onExportPDF: () => void;
        onExportExcel: () => void;
    }
}

interface CustomToolbarProps {
    onExportPDF: () => void;
    onExportExcel: () => void;
}

export default function CustomToolbar({ onExportPDF, onExportExcel }: CustomToolbarProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleExportPDF = () => {
        onExportPDF();
        handleClose();
    };

    const handleExportExcel = () => {
        onExportExcel();
        handleClose();
    };

    return (
        <Toolbar>
            <ColumnsPanelTrigger render={<ToolbarButton><ViewColumnIcon fontSize="small" /></ToolbarButton>} />
            <FilterPanelTrigger render={<ToolbarButton><FilterListIcon fontSize="small" /></ToolbarButton>} />
            <Tooltip title="Exportar">
                <ToolbarButton onClick={handleClick}>
                    <FileDownloadIcon fontSize="small" />
                </ToolbarButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'export-button',
                }}
            >
                <MenuItem onClick={handleExportPDF}>
                    <ListItemIcon>
                        <PictureAsPdfIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>PDF</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleExportExcel}>
                    <ListItemIcon>
                        <TableViewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Excel</ListItemText>
                </MenuItem>
            </Menu>
        </Toolbar>
    );
}
