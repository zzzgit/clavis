import React, { useState, useCallback } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'

function CreateForm({ onSave, onCancel, onOpenEnvSelector }) {
  const [formData, setFormData] = useState({
    key: '',
    token: '',
    expiration: '',
    tag: '',
    comment: '',
    env: ''
  });

  const [activeField, setActiveField] = useState(0);
  const fields = ['key', 'token', 'expiration', 'tag', 'comment', 'env'];
  
  const handleSave = useCallback(() => {
    const newToken = {
      key: formData.key.trim(),
      token: formData.token.trim(),
      expiration: formData.expiration.trim() || null,
      tag: formData.tag.trim() || '',
      comment: formData.comment.trim() || '',
      env: formData.env.trim() || ''
    };
    
    if (!newToken.key || !newToken.token) {
      return;
    }
    
    onSave(newToken);
  }, [formData, onSave]);
  
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

    if ((key.ctrl && input === 'e') || (fields[activeField] === 'env' && key.f2)) {
      onOpenEnvSelector((envVar) => handleChange('env', envVar));
      return;
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const renderField = (fieldName, label, placeholder = '', required = false) => {
    const isActive = fields[activeField] === fieldName;
    const hasValue = formData[fieldName].trim() !== '';
    const isValid = required ? hasValue : true;

    return (
      <Box>
        <Text width={12} color={isActive ? 'green' : (required && !isValid ? 'red' : 'white')}>
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
            <Text color={hasValue ? 'white' : 'gray'}>
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
      borderColor="blue"
      paddingX={2}
      paddingY={0}
      flexDirection="column"
      flexGrow={1}
    >
      <Box marginBottom={1}>
        <Text bold color="blue">
          Create New Token
        </Text>
      </Box>

      <Box flexDirection="column">
        {renderField('key', 'Key', 'Enter unique key', true)}
        {renderField('token', 'Token', 'Enter token value', true)}
        {renderField('expiration', 'Expiration', 'YYYY-MM-DD or empty')}
        {renderField('tag', 'Tag', 'Optional category tag')}
        {renderField('comment', 'Comment', 'Optional description')}
        {renderField('env', 'Env Var', 'e.g., GITHUB_TOKEN, API_KEY')}
      </Box>
    </Box>
  );
}

export default CreateForm;