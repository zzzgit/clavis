import React, { useState, useEffect, useRef } from 'react';
import { Box, useInput, useApp, useStdout } from 'ink';
import SecretTable from './SecretTable.jsx';
import EditForm from './EditForm.jsx';
import CreateForm from './CreateForm.jsx';
import HelpPanel from './HelpPanel.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import Warning from './Warning.jsx';
import SearchInput from './SearchInput.jsx';
import { simpleFuzzySearch } from '../utils/fuzzySearch.js';
import { getSecretStatus } from '../utils/format.js';
import { copyToClipboard } from '../utils/clipboard.js';

const HEADER_HEIGHT = 3;
const FOOTER_HEIGHT = 3;

function App({ secrets: initialSecrets, storage }) {
  const { exit } = useApp()
  const { stdout } = useStdout()
  const [terminalHeight, setTerminalHeight] = useState(stdout?.rows ?? 24)
  const [secrets, setSecrets] = useState(initialSecrets)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [filter, setFilter] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [warning, setWarning] = useState(null)
  const [isSelectingEnvVar, setIsSelectingEnvVar] = useState(false)
  const [pendingEnvVar, setPendingEnvVar] = useState(null)
  const lastDPressRef = useRef(null)

  useEffect(() => {
    if (!stdout) return;
    const onResize = () => setTerminalHeight(stdout.rows);
    stdout.on('resize', onResize);
    return () => stdout.off('resize', onResize);
  }, [stdout]);

  const contentHeight = terminalHeight - HEADER_HEIGHT - FOOTER_HEIGHT;

  const filteredSecrets = simpleFuzzySearch(secrets, filter, ['key', 'tag', 'comment']);

  const selectedSecret = filteredSecrets[selectedIndex];

  const expiredSecretCount = secrets.filter(secret => {
    const status = getSecretStatus(secret);
    return status.label === 'Expired';
  }).length;

  const warningSecretCount = secrets.filter(secret => {
    const status = getSecretStatus(secret);
    return status.label.startsWith('Expires in');
  }).length;
  
  useInput((input, key) => {
    if (showHelp) {
      setShowHelp(false)
      return
    }

    if (isEditing || isCreating || showSearch || showDeleteConfirm || warning) return
    
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit()
      return
    }
    
    if (input === '?') {
      setShowHelp(!showHelp)
      return
    }
    
    if (input === 'e' && selectedSecret) {
      setIsEditing(true);
      return;
    }

    if (input === 'd' && selectedSecret) {
      const now = Date.now();
      if (lastDPressRef.current && now - lastDPressRef.current < 500) {
        lastDPressRef.current = null;
        setShowDeleteConfirm(true);
      } else {
        lastDPressRef.current = now;
      }
      return;
    }

    if (input === 'y' && selectedSecret) {
      if (selectedSecret.sid === null || selectedSecret.sid === undefined) {
        showWarning('No sid to copy', 'warning', 'Warning');
        return;
      }
      const textToCopy = String(selectedSecret.sid);
      const success = copyToClipboard(textToCopy);
      if (success) {
        showWarning(`Copied sid "${selectedSecret.sid}" to clipboard`, 'success', 'Copied');
      } else {
        showWarning('Failed to copy to clipboard', 'error', 'Error');
      }
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
      setSelectedIndex(prev => Math.min(Math.max(filteredSecrets.length - 1, 0), prev + 1));
    } else if (key.home || input === 'g') {
      setSelectedIndex(0);
    } else if (key.end || input === 'G') {
      setSelectedIndex(Math.max(filteredSecrets.length - 1, 0));
    }
  });

  const handleSaveSecret = async (updatedSecret) => {
    try {
      await storage.update(selectedSecret.key, updatedSecret);
      const updatedSecrets = storage.getAll();
      setSecrets(updatedSecrets);
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
  
  const handleDeleteSecret = async () => {
    if (!selectedSecret) return;

    try {
      await storage.delete(selectedSecret.key);
      const updatedSecrets = storage.getAll();
      setSecrets(updatedSecrets);
      const updatedFiltered = simpleFuzzySearch(updatedSecrets, filter, ['key', 'tag', 'comment']);
      setSelectedIndex(prev => Math.min(prev, Math.max(updatedFiltered.length - 1, 0)));
      setShowDeleteConfirm(false);
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
    setSelectedIndex(0);
  };

  const handleCancelSearch = () => {
    setShowSearch(false);
  };
  
  const handleOpenEnvSelector = () => {
    setIsSelectingEnvVar(true)
  }

  const handleEnvVarSelected = (envVar) => {
    setPendingEnvVar({ value: envVar, id: Date.now() })
    setIsSelectingEnvVar(false)
  }

  const handleEnvVarSelectorCancel = () => {
    setIsSelectingEnvVar(false)
  }

  const handleCreateSecret = async (newSecretData) => {
    try {
      await storage.create(newSecretData);
      const updatedSecrets = storage.getAll();
      setSecrets(updatedSecrets);
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
          tokenCount={secrets.length}
          expiredCount={expiredSecretCount}
          warningCount={warningSecretCount}
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
          {showDeleteConfirm ? (
            <ConfirmDialog
              message={`Delete token "${selectedSecret?.key}"? This action cannot be undone.`}
              onConfirm={handleDeleteSecret}
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
              onSave={handleCreateSecret}
              onCancel={handleCancelCreate}
              onOpenEnvSelector={handleOpenEnvSelector}
              pendingEnvVar={pendingEnvVar}
              isSelectingEnvVar={isSelectingEnvVar}
              onEnvVarSelected={handleEnvVarSelected}
              onEnvVarSelectorCancel={handleEnvVarSelectorCancel}
              availableHeight={contentHeight}
            />
          ) : isEditing ? (
            <EditForm
              token={selectedSecret}
              onSave={handleSaveSecret}
              onCancel={handleCancelEdit}
              onOpenEnvSelector={handleOpenEnvSelector}
              pendingEnvVar={pendingEnvVar}
              isSelectingEnvVar={isSelectingEnvVar}
              onEnvVarSelected={handleEnvVarSelected}
              onEnvVarSelectorCancel={handleEnvVarSelectorCancel}
              availableHeight={contentHeight}
            />
          ) : showHelp ? (
            <HelpPanel onClose={() => setShowHelp(false)} />
          ) : (
            <SecretTable
              tokens={filteredSecrets}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
            />
          )}
        </Box>
      </Box>

      {/* Footer - pinned to bottom */}
      <Box height={FOOTER_HEIGHT} flexShrink={0}>
        <Footer
          selectedToken={selectedSecret}
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