import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Repo {
  name: string;
  description: string;
}

interface GitHubRepoProps {
  onCreateFolder: (folderName: string) => void; // New prop
}

const GitHubRepo: React.FC<GitHubRepoProps> = ({ onCreateFolder }) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState<string>('Initial commit');
  const [filePath, setFilePath] = useState<string>('newfile.txt');
  const [fileContent, setFileContent] = useState<string>('This is the content of the new file.');

  // Fetch repositories from the backend
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/user', { withCredentials: true });
        setRepos(response.data.repos || []);
      } catch (err) {
        console.error('Error fetching repositories:', err);
        setError('Failed to fetch repositories.');
      }
    };

    fetchRepos();
  }, []);

  // Handle the commit action to GitHub
  const handleCommit = async () => {
    if (!selectedRepo) {
      alert('Please select a repository to commit to.');
      return;
    }

    try {
      // Post the commit details to the backend API
      const response = await axios.post(
        'http://localhost:3000/api/commit',
        {
          repoName: selectedRepo,
          message: commitMessage,
          filePath: filePath,
          content: fileContent,
        },
        { withCredentials: true }
      );
      alert('Changes committed successfully.');
    } catch (error) {
      alert('Failed to commit changes.');
      console.error(error);
    }
  };

  // Handle the selection of a repo
  const handleSelectRepo = (repoName: string) => {
    setSelectedRepo(repoName);
    onCreateFolder(repoName); // Create a folder with the repo name
  };

  return (
    <div>
     
      {error ? (
        <p>{error}</p>
      ) : (
        <div>
          <ul>
            {repos.length > 0 ? (
              repos.map((repo) => (
                <li 
                  key={repo.name} 
                  onClick={() => handleSelectRepo(repo.name)} 
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
              <h3>Selected Repository: {selectedRepo}</h3>
              <label>Commit Message:</label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
              />
              <label>File Path:</label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
              />
              <label>File Content:</label>
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
              />
              <button onClick={handleCommit}>Commit Changes</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GitHubRepo;
