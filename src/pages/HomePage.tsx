import { useState } from 'react';
import { Link } from 'react-router';
import { Layout } from '../components/Layout';
import { CreatePostModalFormik } from '../components/CreatePostModalFormik';
import { useAuth } from '../hooks/authHooks';
import { Box, Typography, Button, CardMedia } from '@mui/material';

export function HomePage() {
    const [modalOpen, setModalOpen] = useState(false);
    const { currentUser } = useAuth();

    return (
        <Layout title="Мой Блог">
            <Box textAlign="center">
                <Typography variant="h4" component="h2" gutterBottom>
                    Добро пожаловать, <strong>{currentUser?.username}</strong>!
                </Typography>

                <Box display="flex" justifyContent="center" mb={4}>
                    <CardMedia
                        component="img"
                        image="https://www.skillsuccess.com/wp-content/uploads/2020/08/digital-workflow-course-2.jpg"
                        alt="Blog"
                        sx={{
                            maxWidth: '50%',
                            maxHeight: '50%',
                            objectFit: 'contain',
                            borderRadius: 2,
                            boxShadow: 3
                        }}
                    />
                </Box>

                <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={4}>
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                        <Button
                            component={Link}
                            to="/cards"
                            variant="contained"
                            color="primary"
                            size="large"
                        >
                            Карточки
                        </Button>
                        <Button
                            component={Link}
                            to="/table"
                            variant="contained"
                            color="success"
                            size="large"
                        >
                            Таблица
                        </Button>
                    </Box>

                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={() => setModalOpen(true)}
                    >
                        Создать новый пост
                    </Button>
                </Box>

                <CreatePostModalFormik
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                />
            </Box>
        </Layout>
    );
}