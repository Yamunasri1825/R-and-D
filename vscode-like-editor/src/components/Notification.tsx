import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info'; // Optional prop for different types of notifications
  autoClose?: boolean; // Optional auto-close after a timeout
  duration?: number; // Duration before auto-close (in ms)
}

const Notification: React.FC<NotificationProps> = ({
  message,
  onClose,
  type = 'info', // Default type is 'info'
  autoClose = true, // Default is auto-close after 3 seconds
  duration = 3000, // Default duration for auto-close
}) => {
  // Automatically close the notification after the specified duration
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, [autoClose, duration, onClose]);

  // Function to get the appropriate class name based on the notification type
  const getNotificationClass = () => {
    switch (type) {
      case 'success':
        return 'notification success';
      case 'error':
        return 'notification error';
      case 'warning':
        return 'notification warning';
      case 'info':
      default:
        return 'notification info';
    }
  };

  return (
    <div className={getNotificationClass()}>
      <p>{message}</p>
      <button onClick={onClose} className="close-btn">
        Close
      </button>
    </div>
  );
};

export default Notification;
