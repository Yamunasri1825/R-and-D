import React, { useState } from 'react';
import Header from './Header';

const FileEditor: React.FC = () => {
  const [files, setFiles] = useState<string[]>([]);

  const createNewFile = () => {
    const newFileName = `NewFile${files.length + 1}.txt`;
    setFiles([...files, newFileName]);
  };

  return (
    <div>
      <Header onNewFile={createNewFile} />
      <div className="file-list">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            {file}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileEditor;