import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import { searchVendorEnvVars } from '../data/vendorEnvVars.js'

const SELECTOR_OVERHEAD = 8 // border(2) + title+margin(2) + search+margin(2) + scroll indicators(2)

function EnvVarSelector({ onSelect, onCancel, availableHeight }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [vendors, setVendors] = useState(searchVendorEnvVars(''))
  const visibleRows = availableHeight ? Math.max(1, availableHeight - SELECTOR_OVERHEAD) : 6

  // Compute scrollOffset synchronously to avoid extra render cycles
  const scrollOffset = useMemo(() => {
    if (selectedIndex < 0) return 0
    if (selectedIndex >= visibleRows) return selectedIndex - visibleRows + 1
    return 0
  }, [selectedIndex, visibleRows])

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
      setSelectedIndex(prev => (prev - 1 + vendors.length) % vendors.length)
      return
    }

    if (key.downArrow) {
      setSelectedIndex(prev => (prev + 1) % vendors.length)
      return
    }

    if (key.tab) {
      if (key.shift) {
        setSelectedIndex(prev => (prev - 1 + vendors.length) % vendors.length)
      } else {
        setSelectedIndex(prev => (prev + 1) % vendors.length)
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
      const filteredVendors = searchVendorEnvVars(searchTerm)
      setVendors(filteredVendors)
      setSelectedIndex(prev => (prev >= filteredVendors.length ? Math.max(0, filteredVendors.length - 1) : prev))
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const renderVendorItem = (vendor, index) => {
    const isSelected = index === selectedIndex

    return (
      <Box
        key={`${vendor.name}-${vendor.env}`}
        paddingX={1}
        paddingY={0}
        backgroundColor={isSelected ? 'green' : undefined}
        width="100%"
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
    )
  }

  const visibleVendors = vendors.slice(scrollOffset, scrollOffset + visibleRows)
  const hasMoreAbove = scrollOffset > 0
  const hasMoreBelow = scrollOffset + visibleRows < vendors.length

  return (
    <Box
      borderStyle="round"
      borderColor="yellow"
      paddingX={2}
      paddingY={0}
      flexDirection="column"
      flexGrow={1}
    >
      <Box marginBottom={1}>
        <Text bold color="yellow">
          Select Environment Variable
        </Text>
      </Box>

      <Box marginBottom={1}>
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
      
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        {vendors.length === 0 ? (
          <Box padding={1}>
            <Text color="gray">No vendors found matching "{searchTerm}"</Text>
          </Box>
        ) : (
          <>
            {hasMoreAbove && (
              <Box paddingX={1} paddingY={0}>
                <Text color="gray" dimColor>↑ More above</Text>
              </Box>
            )}
            {visibleVendors.map((vendor, index) =>
              renderVendorItem(vendor, scrollOffset + index)
            )}
            {hasMoreBelow && (
              <Box paddingX={1} paddingY={0}>
                <Text color="gray" dimColor>↓ More below</Text>
              </Box>
            )}
          </>
        )}
      </Box>
      
    </Box>
  )
}

export default EnvVarSelector