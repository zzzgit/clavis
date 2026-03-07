import React from 'react';
import { Box, Text } from 'ink';

function Footer({ selectedToken, isEditing, showHelp, onDelete, onKeyPress }) {
  // Keyboard handling is now done in App component using useInput hook
  
  if (showHelp) {
    return (
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={1}
        paddingY={0}
        justifyContent="center"
      >
        <Text color="cyan">Press any key to close help</Text>
      </Box>
    );
  }
  
  if (isEditing) {
    return (
      <Box
        borderStyle="round"
        borderColor="green"
        paddingX={1}
        paddingY={0}
        justifyContent="space-between"
      >
        <Text color="green">Editing: {selectedToken?.key}</Text>
        <Text dimColor>[Tab] Next [Shift+Tab] Prev [Enter] Save [Esc] Cancel</Text>
      </Box>
    );
  }
  
  return (
    <Box
      borderStyle="round"
      borderColor="gray"
      paddingX={1}
      paddingY={0}
      justifyContent="space-between"
    >
      <Box>
        <Text>
          Selected:{' '}
          {selectedToken ? (
            <Text bold color="cyan">
              {selectedToken.key}
            </Text>
          ) : (
            <Text dimColor>None</Text>
          )}
        </Text>
      </Box>
      
      <Box>
        <Text dimColor>
          [↑↓/jk] Navigate • [e] Edit • [d] Delete • [?] Help • [q] Quit
        </Text>
      </Box>
    </Box>
  );
}

export default Footer;