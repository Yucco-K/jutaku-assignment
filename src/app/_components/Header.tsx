'use client'

import { Text } from '@mantine/core'
import UserProfile from './UserProfile'

export const Header = () => {
  return (
    <header
      style={{
        height: 60,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #eaeaea',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        zIndex: 1000,
        position: 'relative',
        marginBottom: '40px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Text
        size="lg"
        fw={700}
        style={{
          cursor: 'pointer',
          color: '#2C3E50',
          letterSpacing: '0.5px'
        }}
      >
        Project Matching App
      </Text>
      <UserProfile />
    </header>
  )
}

export default Header
