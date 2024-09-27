import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

interface CodeEditorProps {
  code: string;
  fileName: string;
  onUpdateCode: (newCode: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, fileName, onUpdateCode }) => {
  const [language, setLanguage] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log('CodeEditor: code prop updated. Length:', code.length, 'Content:', code);
    determineLanguage(fileName);
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
    };
    const detectedLanguage = languageMap[extension || ''] || '';
    console.log('Detected language:', detectedLanguage);
    setLanguage(detectedLanguage);
  };

  const updateHTMLPreview = (htmlContent: string) => {
    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
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
    return languageIds[lang] || 63; // Default to JavaScript if language isn't recognized
  };

  const handleRunCode = async () => {
    console.log('Attempting to run code...');
    console.log('Current language:', language);
    console.log('Code being executed:', code);

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
      console.log('Sending request to backend. Payload:', { source_code: code, language_id: languageId });

      const response = await axios.post('http://localhost:5000/execute', {
        source_code: code,
        language_id: languageId,
      });

      console.log('Response data:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.results && response.data.results.length > 0) {
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
      } else {
        setOutput('No results received from the server.');
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput(`Error: ${error.message || 'An unknown error occurred.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  console.log('CodeEditor rendering. Code:', code);

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
            onChange={(value) => {
              console.log('Editor onChange called with value:', value);
              onUpdateCode(value || '');
            }}
          />
          {language !== 'html' && (
            <button 
              onClick={handleRunCode} 
              disabled={isRunning}
              style={{ marginTop: '10px' }}
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          )}
        </div>
        <div style={{ width: '50%' }}>
          {language === 'html' ? (
            <>
              <h3>Live Preview</h3>
              <iframe
                ref={iframeRef}
                title="HTML Preview"
                style={{ width: '100%', height: '600px', border: '1px solid #ddd' }}
                sandbox="allow-scripts"
              />
            </>
          ) : (
            <>
              <h3>Output</h3>
              <pre 
                style={{ 
                  backgroundColor: '#f0f0f0', 
                  padding: '10px', 
                  borderRadius: '5px', 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  height: '600px',
                  overflowY: 'auto'
                }}
              >
                {output || 'Run the code to see output'}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;