import React from 'react';
import { Box, Text } from 'ink';

function Footer({ selectedToken, isEditing, showHelp, onDelete, onKeyPress }) {
  React.useEffect(() => {
    const { stdin } = process;
    
    const handleKeyPress = (ch, key) => {
      onKeyPress(ch, key);
      
      if (ch === 'd' && selectedToken && !isEditing && !showHelp) {
        onDelete();
      }
    };
    
    stdin.on('keypress', handleKeyPress);
    
    return () => {
      stdin.off('keypress', handleKeyPress);
    };
  }, [selectedToken, isEditing, showHelp, onDelete, onKeyPress]);
  
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