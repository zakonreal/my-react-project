import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postsSlice';
import postDetailReducer from './postDetailSlice';
import themeReducer from './themeSlice';
import authReducer from './authSlice';
import { loggerMiddleware } from './loggerMiddleware';

// Конфигурация Redux Store
export const store = configureStore({
    reducer: {
        posts: postsReducer,
        postDetail: postDetailReducer,
        theme: themeReducer,
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(loggerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;