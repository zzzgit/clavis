import React from 'react';
import { Box, Text } from 'ink';

function HelpPanel({ onClose }) {
  const keyBindings = [
    { key: '↑ / k', description: 'Move selection up' },
    { key: '↓ / j', description: 'Move selection down' },
    { key: 'Enter / e', description: 'Edit selected token' },
    { key: 'd', description: 'Delete selected token' },
    { key: 'f', description: 'Filter tokens (coming soon)' },
    { key: '?', description: 'Show/hide this help' },
    { key: 'q / Ctrl+C', description: 'Quit application' }
  ];
  
  const editModeBindings = [
    { key: 'Tab', description: 'Next field' },
    { key: 'Shift+Tab', description: 'Previous field' },
    { key: 'Enter', description: 'Save changes' },
    { key: 'Esc', description: 'Cancel edit' }
  ];
  
  const statusIndicators = [
    { symbol: '✓', color: 'green', description: 'Active token' },
    { symbol: '!', color: 'yellow', description: 'Expires within 7 days' },
    { symbol: '✗', color: 'red', description: 'Expired token' }
  ];
  
  return (
    <Box
      borderStyle="round"
      borderColor="cyan"
      padding={2}
      flexDirection="column"
      flexGrow={1}
    >
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Clavis TUI Help
        </Text>
      </Box>
      
      <Box marginBottom={2}>
        <Text>Press any key to close help</Text>
      </Box>
      
      <Box marginBottom={2} flexDirection="column">
        <Text bold underline>Navigation</Text>
        {keyBindings.map((binding, index) => (
          <Box key={index} marginLeft={2}>
            <Text width={20} bold color="yellow">
              {binding.key}
            </Text>
            <Text> {binding.description}</Text>
          </Box>
        ))}
      </Box>
      
      <Box marginBottom={2} flexDirection="column">
        <Text bold underline>Edit Mode</Text>
        {editModeBindings.map((binding, index) => (
          <Box key={index} marginLeft={2}>
            <Text width={20} bold color="green">
              {binding.key}
            </Text>
            <Text> {binding.description}</Text>
          </Box>
        ))}
      </Box>
      
      <Box marginBottom={2} flexDirection="column">
        <Text bold underline>Status Indicators</Text>
        {statusIndicators.map((indicator, index) => (
          <Box key={index} marginLeft={2}>
            <Text width={4} bold color={indicator.color}>
              {indicator.symbol}
            </Text>
            <Text> {indicator.description}</Text>
          </Box>
        ))}
      </Box>
      
      <Box marginTop={2} borderStyle="single" borderColor="gray" padding={1}>
        <Text dimColor>
          Clavis Token Manager v1.0.0 • Press any key to return
        </Text>
      </Box>
    </Box>
  );
}

export default HelpPanel;