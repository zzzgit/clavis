import React, { useState, useCallback, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import { searchVendorEnvVars } from '../data/vendorEnvVars.js'

function EnvVarSelector({ onSelect, onCancel }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [vendors, setVendors] = useState(searchVendorEnvVars(''))

  const handleSearch = useCallback((term) => {
    setSearchTerm(term)
    const filteredVendors = searchVendorEnvVars(term)
    setVendors(filteredVendors)
    if (selectedIndex >= filteredVendors.length) {
      setSelectedIndex(Math.max(0, filteredVendors.length - 1))
    }
  }, [selectedIndex])

  const handleSelect = useCallback(() => {
    if (vendors.length > 0 && selectedIndex < vendors.length) {
      onSelect(vendors[selectedIndex].env)
    }
  }, [vendors, selectedIndex, onSelect])

  useInput((input, key) => {
    if (key.escape) {
      onCancel()
      return
    }

    if (key.return) {
      handleSelect()
      return
    }

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1))
      return
    }

    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(vendors.length - 1, prev + 1))
      return
    }

    if (key.tab) {
      if (key.shift) {
        setSelectedIndex(prev => Math.max(0, prev - 1))
      } else {
        setSelectedIndex(prev => Math.min(vendors.length - 1, prev + 1))
      }
      return
    }

    if (key.ctrl && input === 'u') {
      setSearchTerm('')
      setVendors(searchVendorEnvVars(''))
      setSelectedIndex(0)
      return
    }
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm)
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, handleSearch])

  const renderVendorItem = (vendor, index) => {
    const isSelected = index === selectedIndex
    const isLast = index === vendors.length - 1

    return (
      <Box
        key={`${vendor.name}-${vendor.env}`}
        flexDirection="column"
        marginBottom={isLast ? 0 : 1}
      >
        <Box
          paddingX={1}
          paddingY={0}
          backgroundColor={isSelected ? 'green' : undefined}
        >
          <Box width={20}>
            <Text color={isSelected ? 'black' : 'white'} bold={isSelected}>
              {vendor.name}
            </Text>
          </Box>
          <Box marginLeft={2}>
            <Text color={isSelected ? 'black' : 'cyan'}>
              {vendor.env}
            </Text>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      borderStyle="round"
      borderColor="yellow"
      padding={2}
      flexDirection="column"
      flexGrow={1}
    >
      <Box marginBottom={2}>
        <Text bold color="yellow">
          🔧 Select Environment Variable
        </Text>
      </Box>
      
      <Box marginBottom={2}>
        <Text>Search vendor or environment variable:</Text>
      </Box>
      
      <Box marginBottom={2}>
        <Box marginRight={2}>
          <Text color="green">›</Text>
        </Box>
        <Box flexGrow={1}>
          <TextInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Type to search vendors..."
            showCursor
            focus={true}
          />
        </Box>
      </Box>
      
      <Box marginBottom={2} flexDirection="column" maxHeight={12} overflow="hidden">
        {vendors.length === 0 ? (
          <Box padding={1}>
            <Text color="gray">No vendors found matching "{searchTerm}"</Text>
          </Box>
        ) : (
          vendors.map((vendor, index) => renderVendorItem(vendor, index))
        )}
      </Box>
      
      <Box marginBottom={1}>
        <Text dimColor>
          Showing {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
        </Text>
      </Box>
      
      <Box marginTop={2} borderStyle="single" borderColor="gray" padding={1}>
        <Text dimColor>
          Press [↑↓] to navigate, [Enter] to select, [Ctrl+U] to clear search, [Esc] to cancel
        </Text>
      </Box>
    </Box>
  )
}

export default EnvVarSelector