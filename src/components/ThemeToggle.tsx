import { useTheme } from '../hooks/themeHooks';
import { Box, Typography, Switch } from '@mui/material';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">
                Светлая
            </Typography>

            <Switch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                color="default"
            />

            <Typography variant="body2">
                Тёмная
            </Typography>
        </Box>
    );
}