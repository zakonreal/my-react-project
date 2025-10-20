import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/auth';
import axios from 'axios';

interface AuthState {
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    currentUser: null,
    isLoading: true,
    error: null,
};

// Проверка аутентификации
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            axios.defaults.withCredentials = true;
            const response = await axios.get('http://localhost:5000/api/auth/me');
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка проверки аутентификации');
        }
    }
);

// Вход пользователя
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка входа');
        }
    }
);

// Регистрация пользователя
export const registerUser = createAsyncThunk(
    'auth/register',
    async ({ username, password, isAdmin }: { username: string; password: string; isAdmin: boolean }, { rejectWithValue }) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                password,
                isAdmin
            });
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка регистрации');
        }
    }
);

// Выход пользователя
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await axios.post('http://localhost:5000/api/auth/logout');
            return null;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Ошибка выхода');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateAdminStatus: (state, action: PayloadAction<boolean>) => {
            if (state.currentUser) {
                state.currentUser.isAdmin = action.payload;
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUser = action.payload;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.isLoading = false;
                state.currentUser = null;
                state.error = action.payload as string;
            })
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUser = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUser = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.currentUser = null;
                state.error = null;
            });
    },
});

export const { updateAdminStatus, clearError } = authSlice.actions;
export default authSlice.reducer;