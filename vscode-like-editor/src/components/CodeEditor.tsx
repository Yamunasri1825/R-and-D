import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import axios from 'axios';
import { File } from './types'; // Make sure to import the File type
import { parse as parseNotebook } from '@nteract/commutable';
// Import an icon library, e.g., React Icons
import { FaPlay } from 'react-icons/fa';

interface CodeEditorProps {
  code: string;
  fileName: string;
  onUpdateCode: (newCode: string) => void;
  allFiles: File[]; // Add this prop to access all files
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, fileName, onUpdateCode, allFiles }) => {
  const [language, setLanguage] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [waitingForInput, setWaitingForInput] = useState<boolean>(false);
  const userInputRef = useRef<HTMLInputElement>(null);
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (fileName.endsWith('.ipynb')) {
      try {
        // Parse the JSON to validate it's a correct notebook format
        JSON.parse(code);
        setLanguage('json');
      } catch (error) {
        console.error('Error parsing notebook:', error);
        setOutput('Error: Invalid notebook file format.');
      }
    } else {
      determineLanguage(fileName);
    }
  }, [code, fileName]);

  useEffect(() => {
    if (language === 'html') {
      updateHTMLPreview(code);
    }
  }, [code, language]);

  useEffect(() => {
    if (waitingForInput) {
      outputRef.current?.focus();
    }
  }, [waitingForInput]);

  const determineLanguage = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'html': 'html',
      'ipynb': 'json',
    };
    setLanguage(languageMap[extension || ''] || '');
  };

  const updateHTMLPreview = (htmlContent: string) => {
    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        
        // Extract CSS links from HTML content
        const cssLinks = htmlContent.match(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/g) || [];
        
        // Create a base URL for resolving relative paths
        const baseUrl = 'http://localhost:3000/'; // Adjust this to your actual base URL
        
        // Inject CSS contents into the iframe
        cssLinks.forEach(link => {
          const hrefMatch = link.match(/href=["']([^"']+)["']/);
          if (hrefMatch) {
            const cssFileName = hrefMatch[1];
            const cssFile = allFiles.find(file => file.name === cssFileName);
            if (cssFile) {
              doc.write(`<style>${cssFile.content}</style>`);
            }
          }
        });
        
        // Write the HTML content
        doc.write(htmlContent);
        doc.close();
      }
    }
  };

  const getLanguageId = (lang: string): number => {
    const languageIds: Record<string, number> = {
      javascript: 63,
      python: 71,
      java: 62,
      cpp: 54,
    };
    return languageIds[lang] || 63; // Default to JavaScript
  };
  
  const handleExecutionResponse = async (data: any) => {
    console.log('Handling execution response:', data);
    if (data.status === 'input_required') {
      setWaitingForInput(true);
      setOutput(prevOutput => prevOutput + data.prompt);
      outputRef.current?.focus();
    } else if (data.status === 'output') {
      setOutput(prevOutput => prevOutput + data.data);
      setWaitingForInput(true);
    } else if (data.status === 'completed') {
      setOutput(data.output); // Set the complete output
      setWaitingForInput(false);
    } else {
      setOutput(prevOutput => prevOutput + '\nUnexpected response from server');
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      const languageId = getLanguageId(language);

      console.log('Sending request to backend...');
      const response = await axios.post(
        'http://localhost:5002/execute',
        {
          source_code: code,
          language_id: languageId,
        },
        {
          withCredentials: true,
        }
      );
      console.log('Received response from backend:', response.data);

      // Handle the response and update output
      await handleExecutionResponse(response.data);
    } catch (error) {
      console.error('Error communicating with backend:', error);
      setOutput(`Error: ${error.message || 'An unknown error occurred.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleInputSubmit = async () => {
    if (!waitingForInput) return;
    
    setOutput(prevOutput => prevOutput + inputBuffer + '\n');
    
    try {
      console.log('Sending input to backend:', inputBuffer);
      const response = await axios.post(
        'http://localhost:5002/provide-input',
        { input: inputBuffer },
        { withCredentials: true }
      );
      console.log('Received response from backend after input:', response.data);
      
      await handleExecutionResponse(response.data);
    } catch (error) {
      console.error('Error sending input to backend:', error);
      setOutput(prevOutput => prevOutput + `\nError: ${error.message || 'An unknown error occurred.'}`);
      setWaitingForInput(false);
    }
    
    setInputBuffer('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLPreElement>) => {
    if (waitingForInput) {
      e.preventDefault();
      if (e.key === 'Enter') {
        handleInputSubmit();
      } else if (e.key.length === 1) {
        setInputBuffer(prev => prev + e.key);
        setOutput(prev => prev + e.key);
      } else if (e.key === 'Backspace') {
        setInputBuffer(prev => prev.slice(0, -1));
        setOutput(prev => prev.slice(0, -1));
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <h1 style={{ margin: 0, marginRight: '10px' }}>{fileName}</h1>
        {!(fileName.endsWith('.css')) && (
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: isRunning ? '#999' : 'black',
              padding: '5px 50px',
              marginLeft: '300px'
            }}
            title={isRunning ? 'Running...' : 'Run Code'}
          >
            <FaPlay />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ width: '50%' }}>
          <Editor
            height="400px"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => onUpdateCode(value || '')}
            options={{ readOnly: false }}
          />
        </div>
        <div style={{ width: '50%' }}>
          <pre
            ref={outputRef}
            style={{
              backgroundColor: '#f0f0f0',
              padding: '10px',
              borderRadius: '5px',
              height: '550px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
            onKeyDown={handleKeyPress}
            tabIndex={0}
          >
            {output}
            {waitingForInput && <span style={{ backgroundColor: '#ddd' }}>{inputBuffer}</span>}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
