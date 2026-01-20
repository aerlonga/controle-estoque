import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

interface DatePickerFieldProps {
    label: string;
    value: Dayjs | null;
    onChange: (newValue: unknown) => void;
    fullWidth?: boolean;
    sx?: any;
}

export default function DatePickerField({
    label,
    value,
    onChange,
    fullWidth = false,
    sx = {},
}: DatePickerFieldProps) {
    const [open, setOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const formattedValue = value ? value.format('DD/MM/YYYY') : '';

    const handleOpen = (event: React.MouseEvent<Element>) => {
        setAnchorEl(event.currentTarget as HTMLElement);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setAnchorEl(null);
    };

    return (
        <FormControl variant="standard" fullWidth={fullWidth} sx={sx}>
            <Input
                id={`date-picker-${label}`}
                value={formattedValue}
                readOnly
                endAdornment={
                    <InputAdornment position="end" sx={{ marginRight: '8px' }}>
                        <CalendarTodayIcon
                            fontSize="small"
                            onClick={handleOpen}
                            sx={{
                                cursor: 'pointer',
                                color: '#94a3b8',
                                transition: 'color 0.2s',
                                '&:hover': {
                                    color: '#64748b',
                                },
                            }}
                        />
                    </InputAdornment>
                }
                inputProps={{
                    'aria-label': label,
                    style: { cursor: 'pointer' },
                    onClick: handleOpen,
                }}
            />
            <FormHelperText>{label}</FormHelperText>

            <DatePicker
                open={open}
                onClose={handleClose}
                value={value}
                onChange={onChange}
                format="DD/MM/YYYY"
                slotProps={{
                    popper: {
                        anchorEl: anchorEl,
                        placement: 'bottom-end',
                        sx: {
                            '& .MuiPaper-root': {
                                marginTop: '4px',
                            },
                        },
                    },
                    textField: {
                        sx: { display: 'none' },
                    },
                }}
            />
        </FormControl>
    );
}
