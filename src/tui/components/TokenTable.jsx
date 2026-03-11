import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useStdout } from 'ink';
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
  const { stdout } = useStdout()
  const [columnWidths, setColumnWidths] = useState(() => {
    const terminalWidth = stdout.columns || 80;
    return calculateColumnWidths(terminalWidth);
  });
  
  // 計算可用高度：使用父容器的高度
  const terminalHeight = stdout.rows || 24
  const availableHeight = Math.max(terminalHeight - 6, 10) // 總高度減去Header、Footer和邊框
  
  // 計算顯示的數據範圍
  const { startIndex, endIndex } = useMemo(() => {
    if (tokens.length === 0) {
      return { startIndex: 0, endIndex: 0 }
    }
    
    // Table顯示區域高度（減去表頭和滾動指示器）
    const tableHeight = Math.max(availableHeight - 4, 5)
    
    // 確保selectedIndex在視圖中
    let startIndex = 0
    if (selectedIndex >= startIndex + tableHeight) {
      startIndex = selectedIndex - tableHeight + 1
    } else if (selectedIndex < startIndex) {
      startIndex = selectedIndex
    }
    
    // 確保startIndex不為負數
    startIndex = Math.max(0, startIndex)
    
    // 計算endIndex
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
        <Text color="yellow">No tokens found. Press 'q' to quit.</Text>
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
  
  const renderRow = (token, index) => {
    const isSelected = index === selectedIndex;
    const status = getTokenStatus(token);
    const { key, tag, expires, created, token: tokenWidth } = columnWidths;
    
    return (
      <Box backgroundColor={isSelected ? 'blue' : undefined}>
        <Text
          width={key}
          color={isSelected ? 'white' : 'white'}
        >
          {truncateKey(token.key, key)}
        </Text>
        <Text> </Text>
        
        <Text
          width={tag}
          color={isSelected ? 'white' : 'cyan'}
        >
          {truncateTag(token.tag, tag)}
        </Text>
        <Text> </Text>
        
        <Text
          width={expires}
          color={isSelected ? 'white' : status.color}
        >
          {formatExpiration(token.expiration, expires)}
        </Text>
        <Text> </Text>
        
        <Text
          width={created}
          color={isSelected ? 'white' : 'gray'}
        >
          {formatCreatedAt(token.createdAt, created)}
        </Text>
        <Text> </Text>
        
        <Text
          width={tokenWidth}
          color={isSelected ? 'white' : 'gray'}
        >
          {previewToken(token.token, tokenWidth)}
        </Text>
      </Box>
    );
  };
  
  const visibleTokens = tokens.slice(startIndex, endIndex)
  
  return (
    <Box flexDirection="column" height={availableHeight}>
      <Box marginBottom={1}>
        {renderHeader()}
      </Box>
      
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        {visibleTokens.map((token, index) => {
          const actualIndex = startIndex + index
          return (
            <Box key={token.key} marginBottom={0}>
              {renderRow(token, actualIndex)}
            </Box>
          )
        })}
        
        {/* 顯示滾動指示器 */}
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

export default TokenTable;