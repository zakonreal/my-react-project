// Интерфейс поста
export interface Post {
    id: number;
    title: string;
    body: string;
    url: string;
    rate: number;
}

// Интерфейс ответа от API для списка постов
export interface PostsResponse {
    next?: {
        page: number;
        limit: number;
    };
    previous?: {
        page: number;
        limit: number;
    };
    data: Post[];
    totalPosts?: number;
    totalPages?: number;
}

// Интерфейс состояния для списка постов в Redux
export interface PostsState {
    posts: Post[];
    currentPage: number;
    totalPages: number;
    searchTerm: string;
    isLoading: boolean;
    error: string | null;
    viewMode: 'cards' | 'table';
}

// Интерфейс состояния для детальной информации о посте
export interface PostDetailState {
    post: Post | null;
    isLoading: boolean;
    error: string | null;
}