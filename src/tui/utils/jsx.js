import React from 'react'

// Helper function to create React elements without JSX
export function createElement(type, props, ...children) {
	return React.createElement(type, props, ...children)
}

// Shorthand for common elements
export const Box = (props) => React.createElement('Box', props)
export const Text = (props) => React.createElement('Text', props)

// Component factory
export function createComponent(Component) {
	return (props) => React.createElement(Component, props)
}
