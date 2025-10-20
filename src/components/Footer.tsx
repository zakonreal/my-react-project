import { Box, Typography } from '@mui/material';

// Компонент подвала приложения
export function Footer() {
    return (
        <Box
            component="footer"
            bgcolor="primary.main"
            color="white"
            py={2}
        >
            <Box
                maxWidth="lg"
                mx="auto"
                px={2}
                textAlign="center"
            >
                <Typography variant="body2">
                    Все права защищены
                </Typography>
            </Box>
        </Box>
    );
}