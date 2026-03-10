import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

function Warning({ 
  message, 
  title = 'Warning',
  type = 'warning',
  autoClose = false,
  duration = 3000,
  onClose
}) {
  const [visible, setVisible] = useState(true);

  const getBorderColor = () => {
    switch (type) {
      case 'error': return 'red'
      case 'warning': return 'yellow'
      case 'success': return 'green'
      case 'info': return 'blue'
      default: return 'yellow'
    }
  }

  const getTitleColor = () => {
    switch (type) {
      case 'error': return 'red'
      case 'warning': return 'yellow'
      case 'success': return 'green'
      case 'info': return 'blue'
      default: return 'yellow'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      default: return '⚠️'
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'error': return '#330000'
      case 'warning': return '#332200'
      case 'success': return '#003300'
      case 'info': return '#000033'
      default: return '#332200'
    }
  }

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) {
          onClose();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, visible, duration, onClose]);

  useInput((input, key) => {
    if (key.escape || input === ' ') {
      setVisible(false);
      if (onClose) {
        onClose();
      }
    }
  });

  if (!visible) {
    return null;
  }

  return (
    <Box
      borderStyle="round"
      borderColor={getBorderColor()}
      padding={1}
      flexDirection="column"
      backgroundColor={getBackgroundColor()}
    >
      <Box marginBottom={1}>
        <Text bold color={getTitleColor()}>
          {getIcon()}  {title}
        </Text>
      </Box>
      
      <Box>
        <Text>{message}</Text>
      </Box>
      
      <Box marginTop={1} borderStyle="single" borderColor="gray" padding={0.5}>
        <Text dimColor>
          Press [Space] or [Esc] to dismiss
          {autoClose && ` (auto-dismiss in ${duration / 1000}s)`}
        </Text>
      </Box>
    </Box>
  );
}

export default Warning;