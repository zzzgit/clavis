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
        <Text bold color="cyan">
          <Text width={status}>Stat</Text>
          <Text> </Text>
          <Text width={key}>Key</Text>
          <Text> </Text>
          <Text width={tag}>Tag</Text>
          <Text> </Text>
          <Text width={expires}>Expires</Text>
          <Text> </Text>
          <Text width={created}>Created</Text>
          <Text> </Text>
          <Text width={token}>Token Preview</Text>
        </Text>
      </Box>
    );
  };
  
  const renderRow = (token, index) => {
    const isSelected = index === selectedIndex;
    const status = getTokenStatus(token);
    const { status: statusWidth, key, tag, expires, created, token: tokenWidth } = columnWidths;
    
    const rowContent = (
      <Box backgroundColor={isSelected ? 'blue' : undefined}>
        <Text
          width={statusWidth}
          color={isSelected ? 'white' : status.color}
        >
          {` ${status.char} `.padEnd(statusWidth)}
        </Text>
        <Text color={isSelected ? 'white' : undefined}> </Text>
        
        <Text
          width={key}
          color={isSelected ? 'white' : 'white'}
        >
          {truncateKey(token.key, key)}
        </Text>
        <Text color={isSelected ? 'white' : undefined}> </Text>
        
        <Text
          width={tag}
          color={isSelected ? 'white' : 'cyan'}
        >
          {truncateTag(token.tag, tag)}
        </Text>
        <Text color={isSelected ? 'white' : undefined}> </Text>
        
        <Text
          width={expires}
          color={isSelected ? 'white' : status.color}
        >
          {formatExpiration(token.expiration, expires)}
        </Text>
        <Text color={isSelected ? 'white' : undefined}> </Text>
        
        <Text
          width={created}
          color={isSelected ? 'white' : 'gray'}
        >
          {formatCreatedAt(token.createdAt, created)}
        </Text>
        <Text color={isSelected ? 'white' : undefined}> </Text>
        
        <Text
          width={tokenWidth}
          color={isSelected ? 'white' : 'gray'}
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