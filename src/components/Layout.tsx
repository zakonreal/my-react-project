import { Header } from './Header';
import { Footer } from './Footer';
import { useTheme } from '../hooks/themeHooks';
import { ReactNode } from "react";
import { Box, Container } from '@mui/material';

interface LayoutProps {
    children: ReactNode;
    title: string;
}
// Компонент отображения шапки, контента и подвала
export function Layout({ children, title }: LayoutProps) {
    const { theme } = useTheme();

    return (
        <Box
            display="flex"
            flexDirection="column"
            minHeight="100vh"
            sx={{
                backgroundColor: theme === 'dark' ? 'grey.900' : 'background.default',
                color: theme === 'dark' ? 'white' : 'text.primary'
            }}
        >
            <Header title={title} />

            <Box component="main" flexGrow={1} py={3}>
                <Container maxWidth="lg">
                    {children}
                </Container>
            </Box>

            <Footer />
        </Box>
    );
}