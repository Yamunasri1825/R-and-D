import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

interface LivePreviewProps {
  htmlContent: string;
  setHtmlContent: (newContent: string) => void;
}

const LivePreview: React.FC<LivePreviewProps> = ({ htmlContent, setHtmlContent }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // Write the HTML content into the iframe's document
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Editor Section */}
      <div style={{ flex: 1 }}>
        <h3>Editor</h3>
        <Editor
          height="400px"
          language="html"
          theme="vs-dark"
          value={htmlContent}
          onChange={(value) => setHtmlContent(value || '')}
        />
      </div>

      {/* Live Preview Section */}
      <div style={{ flex: 1 }}>
        <h3>Live Preview</h3>
        <iframe
          ref={iframeRef}
          title="HTML Preview"
          style={{ width: '100%', height: '400px', border: '1px solid #ddd' }}
          sandbox="allow-scripts allow-same-origin" // To allow safe scripts execution in iframe
        />
      </div>
    </div>
  );
};

export default LivePreview;
