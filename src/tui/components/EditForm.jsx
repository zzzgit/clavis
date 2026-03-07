import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

function EditForm({ token, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    token: token.token,
    expiration: token.expiration || '',
    tag: token.tag || '',
    comment: token.comment || ''
  });
  
  const [activeField, setActiveField] = useState(0);
  const fields = ['token', 'expiration', 'tag', 'comment'];
  
  const handleSave = useCallback(() => {
    const updates = {};
    
    if (formData.token !== token.token) {
      updates.token = formData.token;
    }
    
    if (formData.expiration !== (token.expiration || '')) {
      updates.expiration = formData.expiration || null;
    }
    
    if (formData.tag !== (token.tag || '')) {
      updates.tag = formData.tag || '';
    }
    
    if (formData.comment !== (token.comment || '')) {
      updates.comment = formData.comment || '';
    }
    
    if (Object.keys(updates).length > 0) {
      onSave(updates);
    } else {
      onCancel();
    }
  }, [formData, token, onSave, onCancel]);
  
  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    
    if (key.return) {
      handleSave();
      return;
    }
    
    if (key.tab) {
      if (key.shift) {
        setActiveField(prev => (prev > 0 ? prev - 1 : fields.length - 1));
      } else {
        setActiveField(prev => (prev < fields.length - 1 ? prev + 1 : 0));
      }
      return;
    }
  });
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const renderField = (fieldName, label, placeholder = '') => {
    const isActive = fields[activeField] === fieldName;
    
    return (
      <Box marginBottom={1}>
        <Text width={12} color={isActive ? 'green' : 'white'}>
          {label}:
        </Text>
        <Box marginLeft={2} flexGrow={1}>
          {isActive ? (
            <TextInput
              value={formData[fieldName]}
              onChange={(value) => handleChange(fieldName, value)}
              placeholder={placeholder}
              showCursor
            />
          ) : (
            <Text
              color={formData[fieldName] ? 'white' : 'gray'}
              backgroundColor={isActive ? 'green' : undefined}
            >
              {formData[fieldName] || placeholder}
            </Text>
          )}
        </Box>
      </Box>
    );
  };
  
  return (
    <Box
      borderStyle="round"
      borderColor="green"
      padding={2}
      flexDirection="column"
      flexGrow={1}
    >
      <Box marginBottom={1}>
        <Text bold color="green">
          Editing Token: {token.key}
        </Text>
      </Box>
      
      <Box marginBottom={2}>
        <Text dimColor>Key cannot be changed (create new token instead)</Text>
      </Box>
      
      <Box flexDirection="column">
        {renderField('token', 'Token', 'Enter new token value')}
        {renderField('expiration', 'Expiration', 'YYYY-MM-DD or empty')}
        {renderField('tag', 'Tag', 'Optional category tag')}
        {renderField('comment', 'Comment', 'Optional description')}
      </Box>
      
      <Box marginTop={2} borderStyle="single" borderColor="gray" padding={1}>
        <Text dimColor>
          Press [Tab] to navigate fields, [Enter] to save, [Esc] to cancel
        </Text>
      </Box>
    </Box>
  );
}

export default EditForm;