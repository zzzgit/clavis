import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

function SearchInput({ initialValue = '', onSearch, onCancel }) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isActive, setIsActive] = useState(true);

  const handleSearch = useCallback(() => {
    onSearch(searchValue);
  }, [searchValue, onSearch]);

  const handleClear = useCallback(() => {
    setSearchValue('');
    onSearch('');
  }, [onSearch]);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.return) {
      handleSearch();
      return;
    }

    if (key.ctrl && input === 'u') {
      handleClear();
      return;
    }
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== initialValue) {
        onSearch(searchValue);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, initialValue, onSearch]);

  return (
    <Box
      borderStyle="round"
      borderColor="blue"
      padding={2}
      flexDirection="column"
      flexGrow={1}
    >
      <Box marginBottom={2}>
        <Text bold color="blue">
          🔍 Search Tokens
        </Text>
      </Box>
      
      <Box marginBottom={2}>
        <Text>Search by key, tag, or comment:</Text>
      </Box>
      
      <Box marginBottom={2}>
        <Box marginRight={2}>
          <Text color="green">›</Text>
        </Box>
        <Box flexGrow={1}>
          <TextInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Type to search..."
            showCursor
            focus={isActive}
          />
        </Box>
      </Box>
      
      <Box marginBottom={2}>
        <Text dimColor>
          Examples: "github", "api.", "prod", "2026", "database"
        </Text>
      </Box>
      
      <Box marginBottom={2}>
        <Text dimColor>
          Supports fuzzy search: "gh" matches "github", "db" matches "database"
        </Text>
      </Box>
      
      <Box marginTop={2} borderStyle="single" borderColor="gray" padding={1}>
        <Text dimColor>
          Press [Enter] to search, [Ctrl+U] to clear, [Esc] to cancel
        </Text>
      </Box>
    </Box>
  );
}

export default SearchInput;