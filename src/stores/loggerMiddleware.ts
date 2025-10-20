import { Middleware } from '@reduxjs/toolkit';

// middleware для логирования действий Redux
export const loggerMiddleware: Middleware =
    (store) => (next) => (action) => {
        console.group(`Redux Action: ${(action as any).type}`);
        console.log('Действие:', action);
        console.log('Состояние до:', store.getState());

        const result = next(action);

        console.log('Состояние после:', store.getState());
        console.groupEnd();

        return result;
    };