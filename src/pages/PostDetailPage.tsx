import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from '../hooks/themeHooks';
import { Layout } from '../components/Layout';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchPostById } from '../stores/postDetailSlice';
import { Box, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';

export function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { post, isLoading, error } = useAppSelector((state) => state.postDetail);
    const { theme } = useTheme();

    // Загрузка поста при изменении ID
    useEffect(() => {
        if (id) dispatch(fetchPostById(id));
    }, [id, dispatch]);

    // Состояния загрузки и ошибок
    if (isLoading) return <Layout title="Загрузка поста..."><CircularProgress /></Layout>;
    if (error) return <Layout title="Ошибка"><Alert severity="error">{error}</Alert></Layout>;
    if (!post) return <Layout title="Пост не найден"><Typography>Пост не найден</Typography></Layout>;

    return (
        <Layout title={post.title}>
            <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                ← Назад
            </Button>

            <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                    {/* Изображение */}
                    <Box flex={1}>
                        <img
                            src={post.url}
                            alt={post.title}
                            style={{
                                width: '100%',
                                height: 256,
                                objectFit: 'cover',
                                borderRadius: 8
                            }}
                        />
                    </Box>

                    <Box flex={2}>
                        <Typography variant="h4" gutterBottom>
                            {post.title}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {post.body}
                        </Typography>

                        <Paper
                            sx={{
                                bgcolor: 'success.main',
                                color: 'white',
                                display: 'inline-block',
                                px: 3,
                                py: 1,
                                borderRadius: 4
                            }}
                        >
                            Рейтинг: {post.rate}/10
                        </Paper>
                    </Box>
                </Box>
            </Paper>
        </Layout>
    );
}