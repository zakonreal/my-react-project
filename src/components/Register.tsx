import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Box, Container, TextField, Button, Typography, Alert, Paper, Checkbox, FormControlLabel } from '@mui/material';
import { RegisterFormData } from '../types/auth';
import { useAuth } from '../hooks/authHooks';

export const Register: React.FC = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        username: '',
        password: '',
        passwordConfirm: '',
        isAdmin: false
    });
    const [validationError, setValidationError] = useState<string>('');

    const { register, currentUser, error, isLoading, clearError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setValidationError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.passwordConfirm) {
            setValidationError('Пароли не совпадают');
            return;
        }

        await register(formData.username, formData.password, formData.isAdmin);
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Регистрация
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        {(error || validationError) && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error || validationError}
                            </Alert>
                        )}

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Имя пользователя"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Пароль"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="passwordConfirm"
                            label="Подтверждение пароля"
                            type="password"
                            id="passwordConfirm"
                            autoComplete="new-password"
                            value={formData.passwordConfirm}
                            onChange={handleChange}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="isAdmin"
                                    checked={formData.isAdmin}
                                    onChange={handleChange}
                                    color="primary"
                                />
                            }
                            label="Администратор"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </Button>

                        <Box textAlign="center">
                            <Link to="/login">
                                <Typography variant="body2">
                                    Уже есть аккаунт? Войти
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};