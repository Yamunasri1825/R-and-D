import React, { useState } from 'react';
import { FaFolder, FaFile, FaPlus } from 'react-icons/fa';

interface File {
  id: string;
  name: string;
  content: string;
}

interface Folder {
  name: string;
  files: File[];
}

interface FolderViewProps {
  folders: Folder[];
  onCreateFolder: (folderName: string) => void;
  onCreateFile: (folderName: string, fileName: string) => void;
  onOpenFile: (file: File) => void;
}

const FolderView: React.FC<FolderViewProps> = ({ folders, onCreateFolder, onCreateFile, onOpenFile }) => {
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFile = (folderName: string) => {
    if (newFileName) {
      onCreateFile(folderName, newFileName);
      setNewFileName('');
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName) {
      onCreateFolder(newFolderName);
      setNewFolderName('');
    }
  };

  return (
    <div className="folder-view">
      {folders.map((folder) => (
        <div key={folder.name} className="folder">
          <h3><FaFolder /> {folder.name}</h3>
          <ul>
            {folder.files.map((file) => (
              <li key={file.id} onClick={() => onOpenFile(file)}>
                <FaFile /> {file.name}
              </li>
            ))}
          </ul>
          <div className="new-file">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="New file name"
            />
            <button onClick={() => handleCreateFile(folder.name)}>
              <FaPlus /> Create File
            </button>
          </div>
        </div>
      ))}
      <div className="new-folder">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder name"
        />
        <button onClick={handleCreateFolder}>
          <FaPlus /> Create Folder
        </button>
      </div>
    </div>
  );
};

export default FolderView;