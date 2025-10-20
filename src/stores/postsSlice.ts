import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PostsResponse, PostsState, Post } from '../types/Post';

// Начальное состояние
const initialState: PostsState = {
    posts: [],
    currentPage: 1,
    totalPages: 0,
    searchTerm: '',
    isLoading: false,
    error: null,
    viewMode: 'cards',
};

// Асинхронная загрузка постов
export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async ({ searchTerm, page }: { searchTerm: string; page: number }, { rejectWithValue }) => {
        try {
            let url: string;
            let totalPages = page;

            if (searchTerm) {
                url = `http://localhost:5000/api/posts-search?term=${encodeURIComponent(searchTerm)}&page=${page}&limit=10`;
            } else {
                url = `http://localhost:5000/api/posts?page=${page}&limit=10`;
            }

            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Ошибка загрузки данных');

            const data: PostsResponse = await response.json();

            if (data.next) {
                totalPages = page + 1;
            } else if (page > 1 && !data.next) {
                totalPages = page;
            }

            return {
                results: data.data,
                info: { pages: totalPages },
                searchTerm,
                page,
            };
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Неизвестная ошибка');
        }
    }
);

// Асинхронное создание поста
export const createPost = createAsyncThunk(
    'posts/createPost',
    async (postData: Omit<Post, 'id'>, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:5000/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Неавторизованный доступ. Пожалуйста, войдите снова.');
                }
                const errorText = await response.text();
                throw new Error(errorText || 'Ошибка при создании поста');
            }

            const newPost: Post = await response.json();
            return newPost;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Неизвестная ошибка');
        }
    }
);

// Создание slice для управления состоянием постов
const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        },
        addNewPost: (state, action: PayloadAction<Post>) => {
            const existingPostIndex = state.posts.findIndex(post => post.id === action.payload.id);
            if (existingPostIndex === -1) {
                state.posts.unshift(action.payload);
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                const { results, info, searchTerm, page } = action.payload;

                if (searchTerm !== state.searchTerm || page === 1) {
                    state.posts = results;
                } else {
                    state.posts.push(...results);
                }
                state.totalPages = info.pages;
                state.searchTerm = searchTerm || '';
                state.currentPage = page;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createPost.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.isLoading = false;
                const newPost = action.payload;
                const existingPost = state.posts.find(post => post.url === newPost.url);
                if (!existingPost) {
                    state.posts.unshift(newPost);
                }
            })
            .addCase(createPost.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                console.error('Ошибка при создании поста:', action.payload);
            });
    },
});

export const { setCurrentPage, setSearchTerm, addNewPost, clearError } = postsSlice.actions;
export default postsSlice.reducer;