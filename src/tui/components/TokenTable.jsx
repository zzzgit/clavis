import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import {
  getTokenStatus,
  truncateKey,
  truncateTag,
  formatExpiration,
  formatCreatedAt,
  previewToken,
  calculateColumnWidths
} from '../utils/format.js';

function TokenTable({ tokens, selectedIndex, onSelect }) {
  const [columnWidths, setColumnWidths] = useState(() => {
    const terminalWidth = process.stdout.columns || 80;
    return calculateColumnWidths(terminalWidth);
  });
  
  useEffect(() => {
    const handleResize = () => {
      const terminalWidth = process.stdout.columns || 80;
      setColumnWidths(calculateColumnWidths(terminalWidth));
    };
    
    process.stdout.on('resize', handleResize);
    return () => {
      process.stdout.off('resize', handleResize);
    };
  }, []);
  
  if (tokens.length === 0) {
    return (
      <Box
        borderStyle="round"
        borderColor="gray"
        padding={2}
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
      >
        <Text color="yellow">No tokens found. Press 'q' to quit.</Text>
      </Box>
    );
  }
  
  const renderHeader = () => {
    const { status, key, tag, expires, created, token } = columnWidths;
    
    return (
      <Box>
        <Text bold>
          <Text color="cyan" width={status}>Stat</Text>
          <Text color="cyan" width={key}>Key</Text>
          <Text color="cyan" width={tag}>Tag</Text>
          <Text color="cyan" width={expires}>Expires</Text>
          <Text color="cyan" width={created}>Created</Text>
          <Text color="cyan" width={token}>Token Preview</Text>
        </Text>
      </Box>
    );
  };
  
  const renderRow = (token, index) => {
    const isSelected = index === selectedIndex;
    const status = getTokenStatus(token);
    const { status: statusWidth, key, tag, expires, created, token: tokenWidth } = columnWidths;
    
    const rowContent = (
      <Box>
        <Text
          width={statusWidth}
          color={status.color}
          backgroundColor={isSelected ? 'blue' : undefined}
        >
          {` ${status.char} `}
        </Text>
        
        <Text
          width={key}
          color={isSelected ? 'white' : 'white'}
          backgroundColor={isSelected ? 'blue' : undefined}
        >
          {truncateKey(token.key, key)}
        </Text>
        
        <Text
          width={tag}
          color={isSelected ? 'white' : 'cyan'}
          backgroundColor={isSelected ? 'blue' : undefined}
        >
          {truncateTag(token.tag, tag)}
        </Text>
        
        <Text
          width={expires}
          color={isSelected ? 'white' : status.color}
          backgroundColor={isSelected ? 'blue' : undefined}
        >
          {formatExpiration(token.expiration, expires)}
        </Text>
        
        <Text
          width={created}
          color={isSelected ? 'white' : 'gray'}
          backgroundColor={isSelected ? 'blue' : undefined}
        >
          {formatCreatedAt(token.createdAt, created)}
        </Text>
        
        <Text
          width={tokenWidth}
          color={isSelected ? 'white' : 'gray'}
          backgroundColor={isSelected ? 'blue' : undefined}
        >
          {previewToken(token.token, tokenWidth)}
        </Text>
      </Box>
    );
    
    return rowContent;
  };
  
  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box
        borderStyle="round"
        borderColor="gray"
        paddingX={1}
        paddingY={0}
        marginBottom={1}
      >
        {renderHeader()}
      </Box>
      
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        {tokens.map((token, index) => (
          <Box key={token.key} marginBottom={0}>
            {renderRow(token, index)}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default TokenTable;