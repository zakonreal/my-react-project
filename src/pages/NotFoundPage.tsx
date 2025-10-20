import { Link } from 'react-router';
import { Layout } from '../components/Layout';
import { Box, Typography, Button } from '@mui/material';

export function NotFoundPage() {
    return (
        <Layout title="Страница не найдена">
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                <Box textAlign="center">
                    <Typography variant="h1" color="primary" gutterBottom>
                        404
                    </Typography>

                    <Typography variant="h4" gutterBottom>
                        Страница не найдена
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Извините, запрашиваемая страница не существует или была перемещена.
                    </Typography>

                    <Button
                        component={Link}
                        to="/"
                        variant="contained"
                        color="primary"
                        size="large"
                    >
                        Вернуться на главную
                    </Button>
                </Box>
            </Box>
        </Layout>
    );
}