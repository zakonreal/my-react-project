import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PostDetailState } from '../types/Post';

const initialState: PostDetailState = {
    post: null,
    isLoading: false,
    error: null,
};

export const fetchPostById = createAsyncThunk(
    'postDetail/fetchPostById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Пост не найден');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Неизвестная ошибка');
        }
    }
);

const postDetailSlice = createSlice({
    name: 'postDetail',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPostById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPostById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.post = action.payload;
            })
            .addCase(fetchPostById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = postDetailSlice.actions;
export default postDetailSlice.reducer;