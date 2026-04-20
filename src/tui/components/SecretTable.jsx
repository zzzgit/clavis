import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useStdout } from 'ink';
import {
  getSecretStatus,
  truncateKey,
  truncateTag,
  formatExpiration,
  formatCreatedAt,
  previewToken,
  calculateColumnWidths
} from '../utils/format.js';

function SecretTable({ tokens, selectedIndex, onSelect }) {
  const { stdout } = useStdout()
  const [columnWidths, setColumnWidths] = useState(() => {
    const terminalWidth = stdout.columns || 80;
    return calculateColumnWidths(terminalWidth);
  });

  const terminalHeight = stdout.rows || 24
  const availableHeight = Math.max(terminalHeight - 6, 10)

  const { startIndex, endIndex } = useMemo(() => {
    if (tokens.length === 0) {
      return { startIndex: 0, endIndex: 0 }
    }

    const tableHeight = Math.max(availableHeight - 4, 5)

    let startIndex = 0
    if (selectedIndex >= startIndex + tableHeight) {
      startIndex = selectedIndex - tableHeight + 1
    } else if (selectedIndex < startIndex) {
      startIndex = selectedIndex
    }

    startIndex = Math.max(0, startIndex)

    const endIndex = Math.min(startIndex + tableHeight, tokens.length)

    return { startIndex, endIndex }
  }, [tokens.length, selectedIndex, availableHeight])

  useEffect(() => {
    const handleResize = () => {
      const terminalWidth = stdout.columns || 80;
      setColumnWidths(calculateColumnWidths(terminalWidth));
    };

    stdout.on('resize', handleResize);
    return () => {
      stdout.off('resize', handleResize);
    };
  }, [stdout]);

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
        <Text color="yellow">No secrets found. Press 'q' to quit.</Text>
      </Box>
    );
  }

  const renderHeader = () => {
    const { key, tag, expires, created, token } = columnWidths;

    return (
      <Box>
        <Text
          width={key}
          bold
          color="cyan"
        >
          {'Key'.padEnd(key)}
        </Text>
        <Text> </Text>
        <Text
          width={tag}
          bold
          color="cyan"
        >
          {'Tag'.padEnd(tag)}
        </Text>
        <Text> </Text>
        <Text
          width={expires}
          bold
          color="cyan"
        >
          {'Expires'.padEnd(expires)}
        </Text>
        <Text> </Text>
        <Text
          width={created}
          bold
          color="cyan"
        >
          {'Created'.padEnd(created)}
        </Text>
        <Text> </Text>
        <Text
          width={token}
          bold
          color="cyan"
        >
          {'Token Preview'.padEnd(token)}
        </Text>
      </Box>
    );
  };

  const renderRow = (secret, index) => {
    const isSelected = index === selectedIndex;
    const status = getSecretStatus(secret);
    const { key, tag, expires, created, token: tokenWidth } = columnWidths;

    return (
      <Box backgroundColor={isSelected ? 'blue' : undefined}>
        <Text
          width={key}
          color={isSelected ? 'white' : 'white'}
        >
          {truncateKey(secret.key, key)}
        </Text>
        <Text> </Text>

        <Text
          width={tag}
          color={isSelected ? 'white' : 'cyan'}
        >
          {truncateTag(secret.tag, tag)}
        </Text>
        <Text> </Text>

        <Text
          width={expires}
          color={isSelected ? 'white' : status.color}
        >
          {formatExpiration(secret.expiration, expires)}
        </Text>
        <Text> </Text>

        <Text
          width={created}
          color={isSelected ? 'white' : 'gray'}
        >
          {formatCreatedAt(secret.createdAt, created)}
        </Text>
        <Text> </Text>

        <Text
          width={tokenWidth}
          color={isSelected ? 'white' : 'gray'}
        >
          {previewToken(secret.token, tokenWidth)}
        </Text>
      </Box>
    );
  };

  const visibleSecrets = tokens.slice(startIndex, endIndex)

  return (
    <Box flexDirection="column" height={availableHeight}>
      <Box marginBottom={1}>
        {renderHeader()}
      </Box>

      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        {visibleSecrets.map((secret, index) => {
          const actualIndex = startIndex + index
          return (
            <Box key={secret.key} marginBottom={0}>
              {renderRow(secret, actualIndex)}
            </Box>
          )
        })}

        {tokens.length > 0 && (
          <Box marginTop={0} justifyContent="space-between">
            <Text dimColor>
              {startIndex > 0 ? '↑ More above' : ''}
            </Text>
            <Text dimColor>
              Showing {startIndex + 1}-{endIndex} of {tokens.length}
            </Text>
            <Text dimColor>
              {endIndex < tokens.length ? '↓ More below' : ''}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default SecretTable;
