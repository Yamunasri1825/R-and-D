const StatusBar: React.FC<{ text: string }> = ({ text }) => (
    <div className="status-bar">
      <p>{text}</p>
    </div>
  );
  
  export default StatusBar;
  