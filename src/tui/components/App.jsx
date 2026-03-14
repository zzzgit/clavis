import React, { useState, useEffect } from 'react';
import { Box, useInput, useApp, useStdout } from 'ink';
import TokenTable from './TokenTable.jsx';
import EditForm from './EditForm.jsx';
import CreateForm from './CreateForm.jsx';
import HelpPanel from './HelpPanel.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import Warning from './Warning.jsx';
import SearchInput from './SearchInput.jsx';
import EnvVarSelector from './EnvVarSelector.jsx';
import { simpleFuzzySearch } from '../utils/fuzzySearch.js';
import { getTokenStatus } from '../utils/format.js';

const HEADER_HEIGHT = 3;
const FOOTER_HEIGHT = 3;

function App({ tokens: initialTokens, storage }) {
  const { exit } = useApp()
  const { stdout } = useStdout()
  const [terminalHeight, setTerminalHeight] = useState(stdout?.rows ?? 24)
  const [tokens, setTokens] = useState(initialTokens)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [filter, setFilter] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [warning, setWarning] = useState(null)
  const [isSelectingEnvVar, setIsSelectingEnvVar] = useState(false)
  const [envVarCallback, setEnvVarCallback] = useState(null)
  
  useEffect(() => {
    if (!stdout) return;
    const onResize = () => setTerminalHeight(stdout.rows);
    stdout.on('resize', onResize);
    return () => stdout.off('resize', onResize);
  }, [stdout]);

  const contentHeight = terminalHeight - HEADER_HEIGHT - FOOTER_HEIGHT;

  const filteredTokens = simpleFuzzySearch(tokens, filter, ['key', 'tag', 'comment']);
  
  const selectedToken = filteredTokens[selectedIndex];
  
  const expiredTokenCount = tokens.filter(token => {
    const status = getTokenStatus(token);
    return status.label === 'Expired';
  }).length;
  
  const warningTokenCount = tokens.filter(token => {
    const status = getTokenStatus(token);
    return status.label.startsWith('Expires in');
  }).length;
  
  useInput((input, key) => {
    if (isEditing || isCreating || showSearch || showDeleteConfirm || showHelp) return
    
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
      showWarning('Token updated successfully', 'success', 'Success');
    } catch (error) {
      showWarning(`Error saving token: ${error.message}`, 'error', 'Error');
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
      showWarning('Token deleted successfully', 'success', 'Success');
    } catch (error) {
      showWarning(`Error deleting token: ${error.message}`, 'error', 'Error');
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const showWarning = (message, type = 'warning', title = 'Warning', autoClose = true) => {
    setWarning({
      message,
      type,
      title,
      autoClose
    });
  };

  const hideWarning = () => {
    setWarning(null);
  };

  const handleSearch = (searchValue) => {
    setFilter(searchValue);
  };

  const handleCancelSearch = () => {
    setShowSearch(false);
  };
  
  const handleOpenEnvSelector = (callback) => {
    setEnvVarCallback(() => callback)
    setIsSelectingEnvVar(true)
  }

  const handleEnvVarSelected = (envVar) => {
    if (envVarCallback) envVarCallback(envVar)
    setIsSelectingEnvVar(false)
    setEnvVarCallback(null)
  }

  const handleEnvVarSelectorCancel = () => {
    setIsSelectingEnvVar(false)
    setEnvVarCallback(null)
  }

  const handleCreateToken = async (newTokenData) => {
    try {
      await storage.create(newTokenData);
      const updatedTokens = storage.getAll();
      setTokens(updatedTokens);
      setIsCreating(false);
      showWarning('Token created successfully', 'success', 'Success');
    } catch (error) {
      showWarning(`Error creating token: ${error.message}`, 'error', 'Error');
    }
  };
  
  return (
    <Box flexDirection="column" height={terminalHeight}>
      {/* Header */}
      <Box height={HEADER_HEIGHT} flexShrink={0}>
        <Header
          tokenCount={tokens.length}
          expiredCount={expiredTokenCount}
          warningCount={warningTokenCount}
          filter={filter}
        />
      </Box>

      {/* Content area - dynamically fills between header and footer */}
      <Box height={contentHeight} flexShrink={0} flexDirection="column" overflow="hidden">
        {warning && (
          <Box flexShrink={0} marginBottom={1}>
            <Warning
              message={warning.message}
              title={warning.title}
              type={warning.type}
              autoClose={warning.autoClose}
              onClose={hideWarning}
            />
          </Box>
        )}
        <Box flexGrow={1} overflow="hidden">
          {isSelectingEnvVar ? (
            <EnvVarSelector
              onSelect={handleEnvVarSelected}
              onCancel={handleEnvVarSelectorCancel}
              availableHeight={contentHeight}
            />
          ) : showDeleteConfirm ? (
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
              onOpenEnvSelector={handleOpenEnvSelector}
            />
          ) : isEditing ? (
            <EditForm
              token={selectedToken}
              onSave={handleSaveToken}
              onCancel={handleCancelEdit}
              onOpenEnvSelector={handleOpenEnvSelector}
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
      </Box>

      {/* Footer - pinned to bottom */}
      <Box height={FOOTER_HEIGHT} flexShrink={0}>
        <Footer
          selectedToken={selectedToken}
          isEditing={isEditing}
          isCreating={isCreating}
          showHelp={showHelp}
          isSelectingEnvVar={isSelectingEnvVar}
        />
      </Box>
    </Box>
  );
}

export default App;