import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, DialogContentText
} from '@mui/material';

function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', confirmColor = 'primary' }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{cancelText}</Button>
                <Button onClick={onConfirm} variant="contained" color={confirmColor} autoFocus>
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmDialog;
