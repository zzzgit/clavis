import React, { useState, useEffect } from 'react';
import { Box, useInput } from 'ink';
import TokenTable from './TokenTable.jsx';
import EditForm from './EditForm.jsx';
import HelpPanel from './HelpPanel.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

function App({ tokens: initialTokens, storage }) {
  const [tokens, setTokens] = useState(initialTokens);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [filter, setFilter] = useState('');
  
  const filteredTokens = filter
    ? tokens.filter(token => 
        token.key.toLowerCase().includes(filter.toLowerCase()) ||
        token.tag?.toLowerCase().includes(filter.toLowerCase()) ||
        token.comment?.toLowerCase().includes(filter.toLowerCase())
      )
    : tokens;
  
  const selectedToken = filteredTokens[selectedIndex];
  
  useInput((input, key) => {
    if (isEditing) return;
    
    if (input === 'q' || (key.ctrl && input === 'c')) {
      process.exit(0);
    }
    
    if (input === '?') {
      setShowHelp(!showHelp);
      return;
    }
    
    if (input === 'e' && selectedToken) {
      setIsEditing(true);
      return;
    }
    
    if (input === 'd' && selectedToken) {
      handleDeleteToken();
      return;
    }
    
    if (input === 'f') {
      // TODO: Implement filter input
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
  
  const handleDeleteToken = async () => {
    if (!selectedToken) return;
    
    // TODO: Implement confirmation dialog
    try {
      await storage.delete(selectedToken.key);
      const updatedTokens = storage.getAll();
      setTokens(updatedTokens);
      setSelectedIndex(prev => Math.min(prev, updatedTokens.length - 1));
    } catch (error) {
      console.error('Error deleting token:', error.message);
    }
  };
  
  return (
    <Box flexDirection="column" height="100%">
      <Header tokenCount={tokens.length} filter={filter} />
      <Box flexGrow={1} flexDirection="column">
        {isEditing ? (
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
        showHelp={showHelp}
        onDelete={handleDeleteToken}
      />
    </Box>
  );
}

export default App;