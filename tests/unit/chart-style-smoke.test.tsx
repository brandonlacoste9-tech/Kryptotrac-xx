/**
 * Smoke Tests for ChartStyle Component
 * 
 * These tests verify that the ChartStyle component continues to work correctly
 * with valid configurations after security enhancements.
 */

import { render } from '@testing-library/react'
import { ChartStyle } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

describe('ChartStyle Component Smoke Tests', () => {
  it('should render with basic color configuration', () => {
    const config: ChartConfig = {
      primary: { color: '#ff0000' },
    }

    const { container } = render(<ChartStyle id="test-chart" config={config} />)
    const styleElement = container.querySelector('style')
    
    expect(styleElement).toBeInTheDocument()
    expect(styleElement?.innerHTML).toContain('--color-primary: #ff0000')
  })

  it('should render with multiple colors', () => {
    const config: ChartConfig = {
      revenue: { color: '#22c55e' },
      expenses: { color: '#ef4444' },
      profit: { color: '#3b82f6' },
    }

    const { container } = render(<ChartStyle id="financial-chart" config={config} />)
    const styleElement = container.querySelector('style')
    
    expect(styleElement).toBeInTheDocument()
    expect(styleElement?.innerHTML).toContain('--color-revenue: #22c55e')
    expect(styleElement?.innerHTML).toContain('--color-expenses: #ef4444')
    expect(styleElement?.innerHTML).toContain('--color-profit: #3b82f6')
  })

  it('should render with theme configuration (light/dark modes)', () => {
    const config: ChartConfig = {
      primary: {
        theme: {
          light: '#ffffff',
          dark: '#000000',
        },
      },
    }

    const { container } = render(<ChartStyle id="themed-chart" config={config} />)
    const styleElement = container.querySelector('style')
    
    expect(styleElement).toBeInTheDocument()
    // Should contain both light and dark theme colors
    expect(styleElement?.innerHTML).toContain('#ffffff')
    expect(styleElement?.innerHTML).toContain('#000000')
    expect(styleElement?.innerHTML).toContain('.dark')
  })

  it('should render with CSS variable colors', () => {
    const config: ChartConfig = {
      primary: { color: 'hsl(var(--chart-1))' },
      secondary: { color: 'var(--chart-2)' },
    }

    const { container } = render(<ChartStyle id="var-chart" config={config} />)
    const styleElement = container.querySelector('style')
    
    expect(styleElement).toBeInTheDocument()
    expect(styleElement?.innerHTML).toContain('hsl(var(--chart-1))')
    expect(styleElement?.innerHTML).toContain('var(--chart-2)')
  })

  it('should render with rgb colors', () => {
    const config: ChartConfig = {
      red: { color: 'rgb(255, 0, 0)' },
      green: { color: 'rgba(0, 255, 0, 0.5)' },
    }

    const { container } = render(<ChartStyle id="rgb-chart" config={config} />)
    const styleElement = container.querySelector('style')
    
    expect(styleElement).toBeInTheDocument()
    expect(styleElement?.innerHTML).toContain('rgb(255, 0, 0)')
    expect(styleElement?.innerHTML).toContain('rgba(0, 255, 0, 0.5)')
  })

  it('should render with hsl colors', () => {
    const config: ChartConfig = {
      primary: { color: 'hsl(120, 100%, 50%)' },
      secondary: { color: 'hsla(240, 100%, 50%, 0.8)' },
    }

    const { container } = render(<ChartStyle id="hsl-chart" config={config} />)
    const styleElement = container.querySelector('style')
    
    expect(styleElement).toBeInTheDocument()
    expect(styleElement?.innerHTML).toContain('hsl(120, 100%, 50%)')
    expect(styleElement?.innerHTML).toContain('hsla(240, 100%, 50%, 0.8)')
  })

  it('should render with CSS color keywords', () => {
    const config: ChartConfig = {
      danger: { color: 'red' },
      success: { color: 'green' },
      info: { color: 'blue' },
      transparent: { color: 'transparent' },
    }

    const { container } = render(<ChartStyle id="keyword-chart" config={config} />)
    const styleElement = container.querySelector('style')
    
    expect(styleElement).toBeInTheDocument()
    expect(styleElement?.innerHTML).toContain('--color-danger: red')
    expect(styleElement?.innerHTML).toContain('--color-success: green')
    expect(styleElement?.innerHTML).toContain('--color-info: blue')
    expect(styleElement?.innerHTML).toContain('--color-transparent: transparent')
  })

  it('should handle complex real-world configuration', () => {
    const config: ChartConfig = {
      bitcoin: {
        label: 'Bitcoin',
        theme: {
          light: '#f7931a',
          dark: '#f7931a',
        },
      },
      ethereum: {
        label: 'Ethereum',
        color: '#627eea',
      },
      portfolio: {
        label: 'Total Portfolio',
        theme: {
          light: 'hsl(var(--chart-1))',
          dark: 'hsl(var(--chart-1))',
        },
      },
      profit: {
        label: 'Profit/Loss',
        color: '#22c55e',
      },
    }

    const { container } = render(<ChartStyle id="crypto-portfolio" config={config} />)
    const styleElement = container.querySelector('style')
    
    expect(styleElement).toBeInTheDocument()
    expect(styleElement?.innerHTML).toContain('--color-bitcoin')
    expect(styleElement?.innerHTML).toContain('--color-ethereum')
    expect(styleElement?.innerHTML).toContain('--color-portfolio')
    expect(styleElement?.innerHTML).toContain('--color-profit')
    expect(styleElement?.innerHTML).toContain('#f7931a')
    expect(styleElement?.innerHTML).toContain('#627eea')
    expect(styleElement?.innerHTML).toContain('hsl(var(--chart-1))')
    expect(styleElement?.innerHTML).toContain('#22c55e')
  })

  it('should generate correct CSS structure', () => {
    const config: ChartConfig = {
      test: { color: '#ff0000' },
    }

    const { container } = render(<ChartStyle id="structure-test" config={config} />)
    const styleElement = container.querySelector('style')
    
    expect(styleElement).toBeInTheDocument()
    const css = styleElement?.innerHTML || ''
    
    // Should contain light theme selector
    expect(css).toMatch(/\[data-chart=structure-test\]/)
    // Should contain dark theme selector
    expect(css).toMatch(/\.dark\s+\[data-chart=structure-test\]/)
    // Should contain CSS custom property
    expect(css).toContain('--color-test: #ff0000')
  })

  it('should handle chart IDs with hyphens and underscores', () => {
    const config: ChartConfig = {
      test: { color: '#ff0000' },
    }

    const validIds = [
      'chart-123',
      'chart_123',
      'my-awesome-chart',
      'test_chart_1',
      'ChartID123',
    ]

    validIds.forEach((id) => {
      const { container } = render(<ChartStyle id={id} config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement).toBeInTheDocument()
      expect(styleElement?.innerHTML).toContain(`data-chart=${id}`)
    })
  })
})
