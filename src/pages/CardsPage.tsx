import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Pagination, TextField, Button, Box, Card, CardMedia, CardContent, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { useTheme } from '../hooks/themeHooks';
import { Layout } from '../components/Layout';
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchPosts, setCurrentPage, setSearchTerm } from '../stores/postsSlice';

export function CardsPage() {
    const dispatch = useAppDispatch();
    const { posts: postsArray, isLoading, error, currentPage, totalPages, searchTerm } = useAppSelector((state) => state.posts);
    const [searchParams, setSearchParams] = useSearchParams();
    const { theme } = useTheme();
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Обработчик поиска
    const handleSearch = useCallback(() => {
        if (searchInputRef.current) {
            const newSearchTerm = searchInputRef.current.value;
            dispatch(setSearchTerm(newSearchTerm));
            dispatch(setCurrentPage(1));

            // Обновляем URL
            const newSearchParams = new URLSearchParams();
            if (newSearchTerm) newSearchParams.set('search', newSearchTerm);
            setSearchParams(newSearchParams);

            // Загружаем посты с новыми параметрами
            dispatch(fetchPosts({ searchTerm: newSearchTerm, page: 1 }));
        }
    }, [dispatch, setSearchParams]);

    // Обработчик пагинации
    const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, page: number) => {
        dispatch(setCurrentPage(page));

        // Обновляем URL
        const newSearchParams = new URLSearchParams(searchParams);
        if (page > 1) {
            newSearchParams.set('page', page.toString());
        } else {
            newSearchParams.delete('page');
        }
        setSearchParams(newSearchParams);

        // Загружаем посты с новой страницей
        dispatch(fetchPosts({ searchTerm, page }));
    }, [dispatch, searchParams, setSearchParams, searchTerm]);

    // Обработчик нажатия Enter в поиске
    const handleSearchKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    // Эффект для загрузки постов при каждом монтировании компонента
    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('page') || '1');
        const searchFromUrl = searchParams.get('search') || '';

        // Устанавливаем состояние из URL
        if (pageFromUrl !== currentPage) {
            dispatch(setCurrentPage(pageFromUrl));
        }
        if (searchFromUrl !== searchTerm) {
            dispatch(setSearchTerm(searchFromUrl));
        }

        // Загружаем посты с текущими параметрами
        dispatch(fetchPosts({
            searchTerm: searchFromUrl || searchTerm,
            page: pageFromUrl || currentPage
        }));
    }, [dispatch]);

    return (
        <Layout title="Посты - Карточки">
            <Box display="flex" gap={2} mb={3}>
                <TextField
                    inputRef={searchInputRef}
                    placeholder="Поиск постов..."
                    defaultValue={searchTerm}
                    onKeyDown={handleSearchKeyDown}
                    size="small"
                    sx={{
                        '& .MuiInputBase-input': {
                            color: theme === 'dark' ? 'white' : 'black',
                        },
                        '& .MuiInputLabel-root': {
                            color: theme === 'dark' ? 'white' : 'black',
                        },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: theme === 'dark' ? 'grey.600' : 'grey.300',
                            },
                            '&:hover fieldset': {
                                borderColor: theme === 'dark' ? 'grey.400' : 'grey.500',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                            },
                            backgroundColor: theme === 'dark' ? 'grey.800' : 'white',
                        }
                    }}
                />
                <Button variant="contained" onClick={handleSearch}>
                    Найти
                </Button>
            </Box>

            {isLoading && (
                <Box display="flex" justifyContent="center" alignItems="center" my={4}>
                    <CircularProgress />
                    <Typography variant="body1" ml={2}>
                        Загрузка постов...
                    </Typography>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!isLoading && !error && (!postsArray || postsArray.length === 0) && (
                <Box textAlign="center" my={4}>
                    <Typography variant="h6">
                        Посты не найдены
                    </Typography>
                </Box>
            )}

            {!isLoading && postsArray && postsArray.length > 0 && (
                <>
                    <Box
                        display="grid"
                        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
                        gap={3}
                    >
                        {postsArray.map((post, index) => (
                            <Card
                                key={`${post.id}-${index}-${Date.now()}`}
                                component={Link}
                                to={`/post/${post.id}`}
                                sx={{
                                    textDecoration: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '420px',
                                    backgroundColor: theme === 'dark' ? 'grey.900' : 'white',
                                    color: theme === 'dark' ? 'white' : 'text.primary',
                                    '&:hover': {
                                        boxShadow: 4
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '200px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        image={post.url}
                                        alt={post.title}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Box>
                                <CardContent sx={{
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    p: 2
                                }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            lineHeight: 1.3,
                                            minHeight: '2.6em',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {post.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            flexGrow: 1,
                                            mb: 2,
                                            color: theme === 'dark' ? 'grey.300' : 'text.secondary',
                                            lineHeight: 1.4,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {post.body}
                                    </Typography>
                                    <Box display="flex" justifyContent="center" mt="auto">
                                        <Chip
                                            label={`Рейтинг: ${post.rate}/10`}
                                            color="success"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {totalPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                showFirstButton
                                showLastButton
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        color: theme === 'dark' ? 'white' : 'black',
                                    },
                                }}
                            />
                        </Box>
                    )}
                </>
            )}
        </Layout>
    );
}