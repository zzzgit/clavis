import React from 'react';
import { Box, Text } from 'ink';

function Footer({ selectedToken, isEditing, isCreating, showHelp }) {
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
  
  if (isCreating) {
    return (
      <Box
        borderStyle="round"
        borderColor="blue"
        paddingX={1}
        paddingY={0}
        justifyContent="space-between"
      >
        <Text color="blue">Creating New Token</Text>
        <Text dimColor>[Tab] Next [Shift+Tab] Prev [Enter] Save [Esc] Cancel</Text>
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
          [↑↓/jk] Navigate • [c] Create • [e] Edit • [d] Delete • [f] Search • [?] Help • [q] Quit
        </Text>
      </Box>
    </Box>
  );
}

export default Footer;