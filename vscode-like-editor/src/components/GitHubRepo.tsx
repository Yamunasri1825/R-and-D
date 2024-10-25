import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

interface Repo {
  name: string;
  description: string;
}

interface File {
  id: string;
  name: string;
  content: string;
}

interface Folder {
  name: string;
  files: File[];
  folders: Folder[];
}

interface GitHubRepoProps {
  onCreateFolder: (folderName: string) => void;
  folders: Folder[];
  changedFiles: File[];
  setChangedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  selectedRepo: string;
  setSelectedRepo: React.Dispatch<React.SetStateAction<string>>;
  commitMessage: string;
  setCommitMessage: React.Dispatch<React.SetStateAction<string>>;
}

const GitHubRepo: React.FC<GitHubRepoProps> = ({ 
  onCreateFolder, 
  folders = [], 
  changedFiles = [], 
  setChangedFiles,
  selectedRepo,
  setSelectedRepo,
  commitMessage,
  setCommitMessage,
}) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [changedFilesState, setChangedFilesState] = useState<File[]>([]);

  // Load last committed files from local storage
  const loadLastCommitFiles = (): File[] => {
    const storedFiles = localStorage.getItem('lastCommitFiles');
    return storedFiles ? JSON.parse(storedFiles) : [];
  };

  // Save files to local storage after commit
  const saveLastCommitFiles = (files: File[]) => {
    localStorage.setItem('lastCommitFiles', JSON.stringify(files));
  };

  const lastCommitFilesRef = useRef<File[]>(loadLastCommitFiles()); // Track files from the last commit

  const getAllFiles = useCallback((folders: Folder[]): File[] => {
    let files: File[] = [];
    folders.forEach(folder => {
      files = [...files, ...folder.files];
      if (folder.folders.length > 0) {
        files = [...files, ...getAllFiles(folder.folders)];
      }
    });
    return files;
  }, []);

  // Fetch repositories when the component mounts
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:3000/api/user', { withCredentials: true });
        setRepos(response.data.repos || []);
      } catch (err) {
        console.error('Error fetching repositories:', err);
        setError('Failed to fetch repositories.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepos();
  }, []);

  // Detect new or changed files
  useEffect(() => {
    const currentFiles = getAllFiles(folders);

    const newChangedFiles = currentFiles.filter(file => {
      const lastCommitFile = lastCommitFilesRef.current.find(f => f.id === file.id);

      // New file or changed content
      return !lastCommitFile || lastCommitFile.content !== file.content;
    });

    setChangedFilesState(newChangedFiles);
  }, [folders, getAllFiles]);

  const handleCommit = async () => {
    if (!selectedRepo) {
      alert('Please select a repository to commit to.');
      return;
    }
    if (!commitMessage.trim()) {
      alert('Please enter a commit message.');
      return;
    }

    if (changedFilesState.length === 0) {
      alert('No changes to commit.');
      return;
    }

    try {
      const commitData = {
        repoName: selectedRepo,
        message: commitMessage,
        files: changedFilesState.map(file => ({
          path: file.name,
          content: file.content,
        })),
      };
      console.log('Commit data being sent:', commitData);

      const response = await axios.post(
        'http://localhost:3000/api/commit',
        commitData,
        { withCredentials: true }
      );
      console.log('Commit response:', response.data);
      alert(`Changes committed successfully. ${changedFilesState.length} files committed.`);

      // After committing, update the reference and local storage to track the last committed state
      const allFiles = getAllFiles(folders);
      lastCommitFilesRef.current = allFiles;
      saveLastCommitFiles(allFiles);
      
      setChangedFilesState([]);
      setCommitMessage('Initial commit');
    } catch (error) {
      console.error('Commit error:', error.response ? error.response.data : error.message);
      alert('Failed to commit changes. Check the console for more details.');
    }
  };

  return (
    <div className="github-repo">
      <h3>GitHub Repositories</h3>
      {error ? (
        <p>{error}</p>
      ) : (
        <div>
          <ul>
            {repos.length > 0 ? (
              repos.map((repo) => (
                <li 
                  key={repo.name} 
                  onClick={() => setSelectedRepo(repo.name)} 
                  style={{ cursor: 'pointer', margin: '10px 0' }}
                >
                  <strong>{repo.name}</strong>: {repo.description} {selectedRepo === repo.name && ' (Selected)'}
                </li>
              ))
            ) : (
              <p>No repositories found.</p>
            )}
          </ul>
          {selectedRepo && (
            <div>
              <h4>Changed Files:</h4>
              {changedFilesState.length > 0 ? (
                <ul>
                  {changedFilesState.map(file => (
                    <li key={file.id}>
                      {file.name} {file.content === '' ? '(Empty file)' : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No changes detected.</p>
              )}
              <label htmlFor="commitMessage">Commit Message (required): </label>
              <input
                id="commitMessage"
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Enter commit message"
                style={{
                  width: '300px',
                  marginRight: '10px',
                  borderColor: 'white',
                  borderWidth: '2px',
                  color: 'black',
                  padding: '5px',
                }}
              />
              <button 
                onClick={handleCommit}
                disabled={!commitMessage.trim() || changedFilesState.length === 0}
              >
                Commit Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GitHubRepo;
