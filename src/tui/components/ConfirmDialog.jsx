import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';

function ConfirmDialog({ message, onConfirm, onCancel }) {
  const [selectedOption, setSelectedOption] = useState(0);
  const options = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

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
      borderColor="red"
      padding={2}
      flexDirection="column"
      flexGrow={1}
    >
      <Box marginBottom={2}>
        <Text bold color="red">
          ⚠️  Confirm Action
        </Text>
      </Box>
      
      <Box marginBottom={2}>
        <Text>{message}</Text>
      </Box>
      
      <Box marginBottom={2}>
        <Text bold>Are you sure?</Text>
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