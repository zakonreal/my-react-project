import { Navigate } from 'react-router';
import { CircularProgress, Box } from '@mui/material';
import { useAppSelector } from '../hooks/reduxHooks';
import { PropsWithChildren } from "react";

export function AdminRoute({ children }: PropsWithChildren) {
    const { currentUser, isLoading } = useAppSelector((state) => state.auth);

    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (!currentUser.isAdmin) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
}