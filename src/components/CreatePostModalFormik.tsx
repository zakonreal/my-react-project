import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '../hooks/reduxHooks';
import { createPost } from '../stores/postsSlice';

interface CreatePostModalProps {
    open: boolean;
    onClose: () => void;
}

const validationSchema = Yup.object({
    title: Yup.string()
        .required('Заголовок обязателен')
        .max(50, 'Заголовок должен быть не длиннее 50 символов'),
    body: Yup.string()
        .required('Описание обязательно')
        .max(1000, 'Описание должно быть не длиннее 1000 символов'),
    url: Yup.string()
        .required('Ссылка на изображение обязательна')
        .matches(/^http/, 'Ссылка должна начинаться с http'),
    rate: Yup.number()
        .required('Рейтинг обязателен')
        .min(1, 'Рейтинг должен быть не менее 1')
        .max(10, 'Рейтинг должен быть не более 10')
});

export function CreatePostModalFormik({ open, onClose }: CreatePostModalProps) {
    const [error, setError] = useState<string | null>(null);
    const dispatch = useAppDispatch();

    const formik = useFormik({
        initialValues: {
            title: '',
            body: '',
            url: '',
            rate: 0
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setError(null);

            try {
                await dispatch(createPost(values)).unwrap();
                onClose();
                formik.resetForm();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            }
        }
    });

    const handleClose = () => {
        formik.resetForm();
        setError(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Создать новый пост</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        margin="dense"
                        id="title"
                        name="title"
                        label="Заголовок"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                    />

                    <TextField
                        fullWidth
                        margin="dense"
                        id="body"
                        name="body"
                        label="Описание"
                        multiline
                        rows={4}
                        value={formik.values.body}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.body && Boolean(formik.errors.body)}
                        helperText={formik.touched.body && formik.errors.body}
                    />

                    <TextField
                        fullWidth
                        margin="dense"
                        id="url"
                        name="url"
                        label="Ссылка на изображение"
                        value={formik.values.url}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.url && Boolean(formik.errors.url)}
                        helperText={formik.touched.url && formik.errors.url}
                    />

                    <TextField
                        fullWidth
                        margin="dense"
                        id="rate"
                        name="rate"
                        label="Рейтинг"
                        type="number"
                        value={formik.values.rate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.rate && Boolean(formik.errors.rate)}
                        helperText={formik.touched.rate && formik.errors.rate}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Отмена</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Создание...' : 'Создать'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}