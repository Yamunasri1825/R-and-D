import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Cell {
  cell_type: 'markdown' | 'code';
  source: string[];
  outputs?: any[];
}

interface Notebook {
  cells: Cell[];
}

const NotebookViewer: React.FC<{ notebookPath: string }> = ({ notebookPath }) => {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [outputs, setOutputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchNotebook();
  }, [notebookPath]);

  const fetchNotebook = async () => {
    try {
      const response = await axios.get(`/api/notebook?path=${notebookPath}`);
      setNotebook(response.data);
    } catch (error) {
      console.error('Error fetching notebook:', error);
    }
  };

  const runCell = async (cellIndex: number, cellContent: string) => {
    try {
      const response = await axios.post('/api/run-cell', { code: cellContent });
      setOutputs(prev => ({ ...prev, [cellIndex]: response.data.output }));
    } catch (error) {
      console.error('Error running cell:', error);
      setOutputs(prev => ({ ...prev, [cellIndex]: 'Error executing cell' }));
    }
  };

  if (!notebook) return <div>Loading notebook...</div>;

  return (
    <div className="notebook-viewer">
      {notebook.cells.map((cell, index) => (
        <div key={index} className={`cell ${cell.cell_type}`}>
          {cell.cell_type === 'markdown' ? (
            <ReactMarkdown>{cell.source.join('')}</ReactMarkdown>
          ) : (
            <>
              <pre>{cell.source.join('')}</pre>
              <button onClick={() => runCell(index, cell.source.join(''))}>Run Cell</button>
              {outputs[index] && <pre className="output">{outputs[index]}</pre>}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotebookViewer;