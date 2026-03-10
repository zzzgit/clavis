import React, { useState, useEffect } from 'react';
import { Box, useInput, useApp } from 'ink';
import TokenTable from './TokenTable.jsx';
import EditForm from './EditForm.jsx';
import CreateForm from './CreateForm.jsx';
import HelpPanel from './HelpPanel.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import SearchInput from './SearchInput.jsx';
import { simpleFuzzySearch } from '../utils/fuzzySearch.js';

function App({ tokens: initialTokens, storage }) {
  const { exit } = useApp()
  const [tokens, setTokens] = useState(initialTokens)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [filter, setFilter] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  const filteredTokens = simpleFuzzySearch(tokens, filter, ['key', 'tag', 'comment']);
  
  const selectedToken = filteredTokens[selectedIndex];
  
  useInput((input, key) => {
    if (isEditing) return
    
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit()
      return
    }
    
    if (input === '?') {
      setShowHelp(!showHelp)
      return
    }
    
    if (input === 'e' && selectedToken) {
      setIsEditing(true);
      return;
    }
    
    if (input === 'd' && selectedToken) {
      setShowDeleteConfirm(true);
      return;
    }
    
    if (input === 'c') {
      setIsCreating(true);
      return;
    }
    
    if (input === 'f' || input === '/') {
      setShowSearch(true);
      return;
    }
    
    if (key.upArrow || input === 'k') {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex(prev => Math.min(filteredTokens.length - 1, prev + 1));
    }
  });
  
  const handleSaveToken = async (updatedToken) => {
    try {
      await storage.update(selectedToken.key, updatedToken);
      const updatedTokens = storage.getAll();
      setTokens(updatedTokens);
      setIsEditing(false);
    } catch (error) {
      // TODO: Show error message
      console.error('Error saving token:', error.message);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleCancelCreate = () => {
    setIsCreating(false);
  };
  
  const handleDeleteToken = async () => {
    if (!selectedToken) return;
    
    try {
      await storage.delete(selectedToken.key);
      const updatedTokens = storage.getAll();
      setTokens(updatedTokens);
      setSelectedIndex(prev => Math.min(prev, updatedTokens.length - 1));
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting token:', error.message);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleSearch = (searchValue) => {
    setFilter(searchValue);
  };

  const handleCancelSearch = () => {
    setShowSearch(false);
  };
  
  const handleCreateToken = async (newTokenData) => {
    try {
      await storage.create(newTokenData);
      const updatedTokens = storage.getAll();
      setTokens(updatedTokens);
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating token:', error.message);
    }
  };
  
  return (
    <Box flexDirection="column" height="100%">
      <Header tokenCount={tokens.length} filter={filter} />
      <Box flexGrow={1} flexDirection="column">
        {showDeleteConfirm ? (
          <ConfirmDialog
            message={`Delete token "${selectedToken?.key}"? This action cannot be undone.`}
            onConfirm={handleDeleteToken}
            onCancel={handleCancelDelete}
          />
        ) : showSearch ? (
          <SearchInput
            initialValue={filter}
            onSearch={handleSearch}
            onCancel={handleCancelSearch}
          />
        ) : isCreating ? (
          <CreateForm
            onSave={handleCreateToken}
            onCancel={handleCancelCreate}
          />
        ) : isEditing ? (
          <EditForm
            token={selectedToken}
            onSave={handleSaveToken}
            onCancel={handleCancelEdit}
          />
        ) : showHelp ? (
          <HelpPanel onClose={() => setShowHelp(false)} />
        ) : (
          <TokenTable
            tokens={filteredTokens}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        )}
      </Box>
      <Footer
        selectedToken={selectedToken}
        isEditing={isEditing}
        isCreating={isCreating}
        showHelp={showHelp}
      />
    </Box>
  );
}

export default App;