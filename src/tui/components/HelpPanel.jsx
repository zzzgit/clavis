import React from 'react';
import { Box, Text } from 'ink';

function HelpPanel({ onClose }) {
  const keyBindings = [
    { key: '↑ / k', description: 'Move selection up' },
    { key: '↓ / j', description: 'Move selection down' },
    { key: 'Home / g', description: 'Jump to first token' },
    { key: 'End / G', description: 'Jump to last token' },
    { key: 'c', description: 'Create new token' },
    { key: 'e', description: 'Edit selected token' },
    { key: 'dd', description: 'Delete selected token' },
    { key: 'y', description: 'Copy sid to clipboard' },
    { key: 'f', description: 'Filter tokens' },
    { key: '?', description: 'Show/hide this help' },
    { key: 'q / Ctrl+C', description: 'Quit application' }
  ];
  
  const editModeBindings = [
    { key: 'Tab', description: 'Next field' },
    { key: 'Shift+Tab', description: 'Previous field' },
    { key: 'Enter', description: 'Save changes' },
    { key: 'Esc', description: 'Cancel edit' }
  ];
  
  const createModeBindings = [
    { key: 'Tab', description: 'Next field' },
    { key: 'Shift+Tab', description: 'Previous field' },
    { key: 'Enter', description: 'Create token' },
    { key: 'Esc', description: 'Cancel create' }
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
      paddingX={2}
      paddingY={0}
      flexDirection="column"
      flexGrow={1}
    >
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Clavis TUI Help
        </Text>
      </Box>
      
      <Box marginBottom={1} flexDirection="column">
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
      
      <Box marginBottom={1} flexDirection="column">
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
      
      <Box marginBottom={1} flexDirection="column">
        <Text bold underline>Create Mode</Text>
        {createModeBindings.map((binding, index) => (
          <Box key={index} marginLeft={2}>
            <Text width={20} bold color="blue">
              {binding.key}
            </Text>
            <Text> {binding.description}</Text>
          </Box>
        ))}
      </Box>
      
      <Box marginBottom={1} flexDirection="column">
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
      
    </Box>
  );
}

export default HelpPanel;