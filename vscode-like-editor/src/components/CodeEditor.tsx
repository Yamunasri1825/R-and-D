import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import axios from 'axios';
import { File } from './types'; // Make sure to import the File type
import { parse as parseNotebook } from '@nteract/commutable';

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

  const determineLanguage = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'html': 'html',
      'ipynb': 'json', // Change this to 'json' for .ipynb files
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
  
  const handleRunCode = async () => {
    if (fileName.endsWith('.ipynb')) {
      setIsRunning(true);
      setOutput('Running notebook...');
      try {
        const response = await axios.post('http://localhost:5001/execute-notebook', {
          notebook: code,
        });
        setOutput(response.data.output);
      } catch (error) {
        setOutput(`Error: ${error.message || 'An unknown error occurred.'}`);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    if (!language) {
      setOutput('Unsupported language.');
      return;
    }
  
    if (!code || !code.trim()) {
      setOutput('Empty code. Please enter some code before running.');
      return;
    }
  
    setIsRunning(true);
    setOutput('');
  
    try {
      const languageId = getLanguageId(language);
  
      const response = await axios.post(
        'http://localhost:5002/execute',
        {
          source_code: code,
          language_id: languageId,
        },
        {
          withCredentials: true, // Ensure credentials are sent
        }
      );
  
      const result = response.data.results[0];
      if (result.actualOutput) {
        setOutput(result.actualOutput.trim());
      } else if (result.errorOutput) {
        setOutput(`Error: ${result.errorOutput.trim()}`);
      } else if (result.compilationError) {
        setOutput(`Compilation Error: ${result.compilationError.trim()}`);
      } else {
        setOutput('No output received from the server.');
      }
    } catch (error) {
      setOutput(`Error: ${error.message || 'An unknown error occurred.'}`);
    } finally {
      setIsRunning(false);
    }
  };
  

  return (
    <div style={{ padding: '20px' }}>
      <h1>{fileName}</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ width: '50%' }}>
          <Editor
            height="400px"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => onUpdateCode(value || '')}
            options={{ readOnly: false }} // Allow editing for all file types
          />
                  {!(fileName.endsWith('.css')) && (
            <button onClick={handleRunCode} disabled={isRunning} style={{ marginTop: '10px' }}>
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          )}
        </div>
        <div style={{ width: '50%' }}>
          <pre style={{
            backgroundColor: '#f0f0f0',
            padding: '10px',
            borderRadius: '5px',
            height: '600px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
