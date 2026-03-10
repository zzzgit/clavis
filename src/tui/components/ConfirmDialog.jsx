import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';

function ConfirmDialog({ 
  message, 
  title = 'Confirm Action',
  confirmText = 'Yes', 
  cancelText = 'No',
  onConfirm, 
  onCancel,
  type = 'warning'
}) {
  const [selectedOption, setSelectedOption] = useState(0);
  const options = [
    { label: confirmText, value: true },
    { label: cancelText, value: false }
  ];

  const getBorderColor = () => {
    switch (type) {
      case 'danger': return 'red'
      case 'warning': return 'yellow'
      case 'info': return 'blue'
      default: return 'yellow'
    }
  }

  const getTitleColor = () => {
    switch (type) {
      case 'danger': return 'red'
      case 'warning': return 'yellow'
      case 'info': return 'blue'
      default: return 'yellow'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'danger': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '⚠️'
    }
  }

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.return) {
      if (selectedOption === 0) {
        handleConfirm();
      } else {
        onCancel();
      }
      return;
    }

    if (key.leftArrow || input === 'h') {
      setSelectedOption(prev => Math.max(0, prev - 1));
    } else if (key.rightArrow || input === 'l') {
      setSelectedOption(prev => Math.min(options.length - 1, prev + 1));
    }
  });

  return (
    <Box
      borderStyle="round"
      borderColor={getBorderColor()}
      padding={2}
      flexDirection="column"
      flexGrow={1}
    >
      <Box marginBottom={2}>
        <Text bold color={getTitleColor()}>
          {getIcon()}  {title}
        </Text>
      </Box>
      
      <Box marginBottom={2}>
        <Text>{message}</Text>
      </Box>
      
      <Box flexDirection="row" justifyContent="center" gap={4}>
        {options.map((option, index) => (
          <Box
            key={option.label}
            borderStyle={selectedOption === index ? 'bold' : 'single'}
            borderColor={selectedOption === index ? 'green' : 'gray'}
            paddingX={2}
            paddingY={1}
          >
            <Text
              color={selectedOption === index ? 'green' : 'white'}
              bold={selectedOption === index}
            >
              {option.label}
            </Text>
          </Box>
        ))}
      </Box>
      
      <Box marginTop={2} borderStyle="single" borderColor="gray" padding={1}>
        <Text dimColor>
          Press [←→/hl] to select, [Enter] to confirm, [Esc] to cancel
        </Text>
      </Box>
    </Box>
  );
}

export default ConfirmDialog;