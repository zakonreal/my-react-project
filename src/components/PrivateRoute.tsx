import { Navigate } from 'react-router';
import { useAppSelector } from '../hooks/reduxHooks';
import { PropsWithChildren } from "react";
import { Box, CircularProgress } from '@mui/material';

export function PrivateRoute({ children }: PropsWithChildren) {
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

    return currentUser ? <>{children}</> : <Navigate to="/login" />;
}