export interface File {
    id: string;
    name: string;
    content: string;
}

export interface Folder {
    name: string;
    files: File[];
    folders: Folder[];
}