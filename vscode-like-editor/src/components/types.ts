export interface File {
    id: string;
    name: string;
    content: string;
    language?: string;
    isChanged?: boolean;
}

export interface Folder {
    name: string;
    files: File[];
    folders: Folder[];
}
