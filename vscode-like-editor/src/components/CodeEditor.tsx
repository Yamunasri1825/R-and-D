import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const CodeEditor = () => {
  const [code, setCode] = useState('<!DOCTYPE html>\n<html>\n<head>\n<title>HTML Preview</title>\n</head>\n<body>\n<h1>Hello, World!</h1>\n</body>\n</html>');
  const [fileName, setFileName] = useState('index.html'); // Default file name
  const [language, setLanguage] = useState('html'); // Default language is HTML
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update iframe content for HTML files
  useEffect(() => {
    if (language === 'html' && iframeRef.current) {
      iframeRef.current.srcdoc = code; // Dynamically set the iframe content to the code
    }
  }, [code, language]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setLanguage(getLanguageFromExtension(file.name));

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result;
        setCode(fileContent as string);
      };
      reader.readAsText(file);
    }
  };

  const getLanguageFromExtension = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'html':
        return 'html';
      case 'js':
        return 'javascript';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      case 'c':
        return 'c';
      default:
        return 'plaintext'; // Default to plaintext for unsupported types
    }
  };

  const handleRunCode = async () => {
    if (language === 'html') {
      // HTML is already previewed live, no need to execute
      return;
    }

    setIsRunning(true);
    try {
      const response = await axios.post('http://localhost:5000/execute', {
        code: code,
        language_id: getLanguageId(language),
      });

      setOutput(response.data.results[0]?.actualOutput || 'No output');
    } catch (error) {
      setOutput(`Error: ${error.response?.data?.error || error.message}`);
    }
    setIsRunning(false);
  };

  const getLanguageId = (language: string) => {
    switch (language) {
      case 'javascript':
        return 63; // JavaScript ID for Judge0 API
      case 'python':
        return 71; // Python ID for Judge0 API
      case 'java':
        return 62; // Java ID for Judge0 API
      case 'cpp':
        return 54; // C++ ID for Judge0 API
      case 'c':
        return 50; // C ID for Judge0 API
      default:
        return 63; // Default to JavaScript if unknown
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1 }}>
        <h1>Code Editor with Live Preview</h1>

        <label>
          File Name:
          <input
            type="text"
            value={fileName}
            readOnly
          />
        </label>

        <input type="file" onChange={handleFileUpload} />

        <Editor
          height="400px"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
        />

        {language !== 'html' && (
          <button onClick={handleRunCode} disabled={isRunning}>
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        )}

        {output && (
          <div>
            <h3>Output:</h3>
            <pre>{output}</pre>
          </div>
        )}
      </div>

      {language === 'html' && (
        <div style={{ flex: 1 }}>
          <h3>Live Preview:</h3>
          <iframe
            ref={iframeRef}
            title="HTML Preview"
            sandbox="allow-scripts"
            style={{ width: '100%', height: '400px', border: '1px solid #ddd' }}
          />
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
