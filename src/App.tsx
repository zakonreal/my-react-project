import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Outlet } from 'react-router';
import { Provider } from "react-redux";
import { HomePage } from './pages/HomePage';
import { CardsPage } from './pages/CardsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
import { store } from "./stores/store";
import { checkAuth } from "./stores/authSlice";
import { useAppDispatch } from "./hooks/reduxHooks";
import './index.css';

const TablePage = lazy(() => import('./pages/TablePage'));

// Компонент для инициализации аутентификации
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    return <>{children}</>;
};

export function App() {
    return (
        <Provider store={store}>
            <AuthInitializer>
                <div className="min-h-screen flex flex-col">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route path="/" element={
                            <PrivateRoute>
                                <HomePage />
                            </PrivateRoute>
                        } />
                        <Route path="/cards" element={
                            <PrivateRoute>
                                <CardsPage />
                            </PrivateRoute>
                        } />
                        <Route path="/table" element={
                            <PrivateRoute>
                                <Suspense fallback={<div className="text-center py-8">Загрузка таблицы...</div>}>
                                    <TablePage />
                                </Suspense>
                            </PrivateRoute>
                        } />
                        <Route path="/post/:id" element={
                            <AdminRoute>
                                <PostDetailPage />
                            </AdminRoute>
                        } />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                    <Outlet />
                </div>
            </AuthInitializer>
        </Provider>
    );
}