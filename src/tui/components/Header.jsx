import React from 'react';
import { Box, Text } from 'ink';

function Header({ tokenCount, expiredCount = 0, warningCount = 0, filter }) {
  
  return (
    <Box
      borderStyle="round"
      borderColor="blue"
      paddingX={1}
      paddingY={0}
      flexDirection="column"
    >
      <Box justifyContent="space-between">
        <Text bold color="blue">
          Clavis Token Manager v1.0.0
        </Text>
        <Text>
          {filter ? (
            <Text color="yellow">Filter: {filter}</Text>
          ) : (
            <Text color="white">
              {tokenCount} tokens
              {expiredCount > 0 && (
                <Text color="red"> ({expiredCount} expired)</Text>
              )}
            </Text>
          )}
        </Text>
      </Box>
      
      {tokenCount > 0 && warningCount > 0 && (
        <Box marginTop={0}>
          <Text dimColor>
            <Text color="yellow"> {warningCount} expiring soon</Text>
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default Header;