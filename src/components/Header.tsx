import { Link, useLocation, useNavigate } from 'react-router';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { ThemeToggle } from './ThemeToggle';
import { AdminToggle } from './AdminToggle';
import { useAuth } from '../hooks/authHooks';

interface HeaderProps {
    title: string;
}
// Компонент шапки приложения
export function Header({ title }: HeaderProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const showHomeButton = location.pathname === '/cards' || location.pathname === '/table';

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    if (!currentUser) {
        return null;
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Box display="flex" alignItems="center" flexGrow={1}>
                    {showHomeButton && (
                        <Button
                            component={Link}
                            to="/"
                            variant="contained"
                            color="primary"
                            sx={{ mr: 2 }}
                        >
                            ← На главную
                        </Button>
                    )}
                    <Typography variant="h6">
                        {title}
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                    {/* Теперь показываем эти элементы ТОЛЬКО для авторизованных пользователей */}
                    <AdminToggle />
                    <ThemeToggle />
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleLogout}
                    >
                        Выйти
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}