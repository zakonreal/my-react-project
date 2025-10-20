import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Pagination, TextField, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { useTheme } from '../hooks/themeHooks';
import { Layout } from '../components/Layout';
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { fetchPosts, setCurrentPage, setSearchTerm } from '../stores/postsSlice';

export default function TablePage() {
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
        <Layout title="Посты - Таблица">
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
                    <TableContainer
                        component={Paper}
                        sx={{
                            backgroundColor: theme === 'dark' ? 'grey.900' : 'background.paper',
                            color: theme === 'dark' ? 'white' : 'text.primary'
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{
                                    backgroundColor: theme === 'dark' ? 'grey.800' : 'grey.100'
                                }}>
                                    <TableCell sx={{ color: 'inherit' }}>Изображение</TableCell>
                                    <TableCell sx={{ color: 'inherit' }}>Заголовок</TableCell>
                                    <TableCell sx={{ color: 'inherit' }}>Описание</TableCell>
                                    <TableCell sx={{ color: 'inherit' }}>Рейтинг</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {postsArray.map((post, index) => (
                                    <TableRow
                                        key={`${post.id}-${index}-${Date.now()}`}
                                        hover
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: theme === 'dark' ? 'grey.800' : 'grey.50'
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
                                                <Box
                                                    component="img"
                                                    src={post.url}
                                                    alt={post.title}
                                                    sx={{
                                                        width: 64,
                                                        height: 64,
                                                        objectFit: 'cover',
                                                        borderRadius: 1
                                                    }}
                                                />
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
                                                <Typography
                                                    variant="body2"
                                                    color="primary"
                                                    sx={{ color: theme === 'dark' ? 'primary.light' : 'primary.main' }}
                                                >
                                                    {post.title}
                                                </Typography>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: theme === 'dark' ? 'grey.100' : 'grey.800' }}
                                            >
                                                {post.body}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${post.rate}/10`}
                                                color="success"
                                                variant="filled"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

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