import { useAuth } from '../hooks/authHooks';
import { Box, Typography, Switch } from '@mui/material';

export function AdminToggle() {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return null;
    }

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">
                Пользователь
            </Typography>

            <Switch
                checked={currentUser.isAdmin}
                readOnly
                color="default"
            />

            <Typography variant="body2">
                Администратор
            </Typography>
        </Box>
    );
}