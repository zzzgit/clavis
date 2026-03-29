import React from 'react';
import { Box, Text } from 'ink';

function Footer({ selectedToken, isEditing, isCreating, showHelp, isSelectingEnvVar }) {
  // Keyboard handling is now done in App component using useInput hook

  if (isSelectingEnvVar) {
    return (
      <Box
        borderStyle="round"
        borderColor="yellow"
        paddingX={1}
        paddingY={0}
        justifyContent="space-between"
        width="100%"
      >
        <Text color="yellow">Select Env Var</Text>
        <Text dimColor>[↑↓] Navigate  [Enter] Select  [Ctrl+U] Clear  [Esc] Cancel</Text>
      </Box>
    );
  }

  if (showHelp) {
    return (
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={1}
        paddingY={0}
        justifyContent="center"
        width="100%"
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
        width="100%"
      >
        <Text color="blue">Creating New Token</Text>
        <Text dimColor>[Tab] Next  [Ctrl+E] Env Var  [Enter] Save  [Esc] Cancel</Text>
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
        width="100%"
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
      width="100%"
    >
      <Box>
        <Text>
          Selected:{' '}
          {selectedToken ? (
            <Text bold color="cyan">
              {selectedToken.key.length > 15 ? selectedToken.key.slice(0, 15) + '…' : selectedToken.key}
            </Text>
          ) : (
            <Text dimColor>None</Text>
          )}
        </Text>
      </Box>

      <Box>
        <Text dimColor>
          c:New  e:Edit  dd:Del  y:Copy  f:Find  ?:Help  q:Quit
        </Text>
      </Box>
    </Box>
  );
}

export default Footer;