/**
 * Security Tests for ChartStyle Component
 * 
 * These tests validate that the ChartStyle component properly sanitizes
 * inputs and prevents potential CSS injection attacks through dangerouslySetInnerHTML.
 */

import { render } from '@testing-library/react'
import { ChartStyle } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

describe('ChartStyle Component Security Tests', () => {
  // Suppress console.error for expected validation failures
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('Chart ID Validation', () => {
    it('should accept valid alphanumeric chart IDs', () => {
      const config: ChartConfig = {
        test: { color: '#ff0000' },
      }

      const { container } = render(<ChartStyle id="chart-123" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement).toBeInTheDocument()
      expect(styleElement?.innerHTML).toContain('data-chart=chart-123')
    })

    it('should accept chart IDs with hyphens and underscores', () => {
      const config: ChartConfig = {
        test: { color: '#ff0000' },
      }

      const { container } = render(<ChartStyle id="chart_test-123" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement).toBeInTheDocument()
    })

    it('should reject chart IDs with special characters', () => {
      const config: ChartConfig = {
        test: { color: '#ff0000' },
      }

      const { container } = render(<ChartStyle id="chart<script>" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement).not.toBeInTheDocument()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('SECURITY: Invalid chart ID rejected'),
        'chart<script>'
      )
    })

    it('should reject chart IDs with CSS injection attempts', () => {
      const config: ChartConfig = {
        test: { color: '#ff0000' },
      }

      const { container } = render(<ChartStyle id="chart]; body {" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement).not.toBeInTheDocument()
    })
  })

  describe('Config Key Validation', () => {
    it('should accept valid alphanumeric config keys', () => {
      const config: ChartConfig = {
        primary: { color: '#ff0000' },
        secondary: { color: '#00ff00' },
        'test-key': { color: '#0000ff' },
        test_key: { color: '#ffff00' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).toContain('--color-primary')
      expect(styleElement?.innerHTML).toContain('--color-secondary')
      expect(styleElement?.innerHTML).toContain('--color-test-key')
      expect(styleElement?.innerHTML).toContain('--color-test_key')
    })

    it('should reject config keys with special characters', () => {
      const config: ChartConfig = {
        'test<script>': { color: '#ff0000' },
        normal: { color: '#00ff00' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      // Should not include the malicious key
      expect(styleElement?.innerHTML).not.toContain('test<script>')
      // Should include the normal key
      expect(styleElement?.innerHTML).toContain('--color-normal')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('SECURITY: Invalid config key rejected'),
        'test<script>'
      )
    })

    it('should reject config keys with CSS injection patterns', () => {
      const config: ChartConfig = {
        'test; body {': { color: '#ff0000' },
        safe: { color: '#00ff00' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).not.toContain('test; body {')
      expect(styleElement?.innerHTML).toContain('--color-safe')
    })
  })

  describe('Color Value Validation', () => {
    it('should accept valid hex colors', () => {
      const config: ChartConfig = {
        test1: { color: '#fff' },
        test2: { color: '#ffffff' },
        test3: { color: '#ff00ff00' }, // 8-digit hex with alpha
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).toContain('#fff')
      expect(styleElement?.innerHTML).toContain('#ffffff')
      expect(styleElement?.innerHTML).toContain('#ff00ff00')
    })

    it('should accept valid rgb colors', () => {
      const config: ChartConfig = {
        test1: { color: 'rgb(255, 0, 0)' },
        test2: { color: 'rgb(0,255,0)' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).toContain('rgb(255, 0, 0)')
      expect(styleElement?.innerHTML).toContain('rgb(0,255,0)')
    })

    it('should accept valid rgba colors', () => {
      const config: ChartConfig = {
        test: { color: 'rgba(255, 0, 0, 0.5)' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).toContain('rgba(255, 0, 0, 0.5)')
    })

    it('should accept valid hsl colors', () => {
      const config: ChartConfig = {
        test: { color: 'hsl(120, 100%, 50%)' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).toContain('hsl(120, 100%, 50%)')
    })

    it('should accept valid hsla colors', () => {
      const config: ChartConfig = {
        test: { color: 'hsla(120, 100%, 50%, 0.5)' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).toContain('hsla(120, 100%, 50%, 0.5)')
    })

    it('should accept CSS color keywords', () => {
      const config: ChartConfig = {
        test1: { color: 'red' },
        test2: { color: 'blue' },
        test3: { color: 'transparent' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).toContain('red')
      expect(styleElement?.innerHTML).toContain('blue')
      expect(styleElement?.innerHTML).toContain('transparent')
    })

    it('should reject colors with JavaScript code', () => {
      const config: ChartConfig = {
        malicious: { color: 'red; } </style><script>alert("XSS")</script><style>' },
        safe: { color: '#00ff00' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      // Should not include malicious color
      expect(styleElement?.innerHTML).not.toContain('script')
      expect(styleElement?.innerHTML).not.toContain('alert')
      // Should include safe color
      expect(styleElement?.innerHTML).toContain('--color-safe')
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should reject colors with CSS injection attempts', () => {
      const config: ChartConfig = {
        malicious: { color: 'red; } body { background: url("javascript:alert(1)") }' },
        safe: { color: '#00ff00' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).not.toContain('javascript')
      expect(styleElement?.innerHTML).toContain('--color-safe')
    })

    it('should reject invalid hex colors', () => {
      const config: ChartConfig = {
        invalid: { color: '#gggggg' },
        safe: { color: '#00ff00' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).not.toContain('#gggggg')
      expect(styleElement?.innerHTML).toContain('--color-safe')
    })
  })

  describe('Theme Color Validation', () => {
    it('should accept valid theme colors for light and dark modes', () => {
      const config: ChartConfig = {
        test: {
          theme: {
            light: '#ffffff',
            dark: '#000000',
          },
        },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).toContain('#ffffff')
      expect(styleElement?.innerHTML).toContain('#000000')
    })

    it('should reject theme colors with malicious values', () => {
      const config: ChartConfig = {
        malicious: {
          theme: {
            light: 'red; } </style><script>alert(1)</script><style>',
            dark: '#000000',
          },
        },
        safe: { color: '#00ff00' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement?.innerHTML).not.toContain('script')
      expect(styleElement?.innerHTML).toContain('--color-safe')
    })
  })

  describe('Empty and Edge Cases', () => {
    it('should handle empty config gracefully', () => {
      const config: ChartConfig = {}

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement).not.toBeInTheDocument()
    })

    it('should handle config with no colors', () => {
      const config: ChartConfig = {
        test: { label: 'Test Label' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement).not.toBeInTheDocument()
    })

    it('should handle mixed valid and invalid entries', () => {
      const config: ChartConfig = {
        valid1: { color: '#ff0000' },
        'invalid<script>': { color: '#00ff00' },
        valid2: { color: '#0000ff' },
        invalid_color: { color: 'javascript:alert(1)' },
        valid3: { color: 'blue' },
      }

      const { container } = render(<ChartStyle id="test" config={config} />)
      const styleElement = container.querySelector('style')
      
      // Should include valid entries
      expect(styleElement?.innerHTML).toContain('--color-valid1')
      expect(styleElement?.innerHTML).toContain('--color-valid2')
      expect(styleElement?.innerHTML).toContain('--color-valid3')
      
      // Should not include invalid entries
      expect(styleElement?.innerHTML).not.toContain('script')
      expect(styleElement?.innerHTML).not.toContain('javascript')
    })
  })

  describe('Integration with Real Usage Patterns', () => {
    it('should work with typical chart configuration', () => {
      const config: ChartConfig = {
        revenue: {
          label: 'Revenue',
          theme: {
            light: 'hsl(var(--chart-1))',
            dark: 'hsl(var(--chart-1))',
          },
        },
        expenses: {
          label: 'Expenses',
          color: '#ef4444',
        },
      }

      const { container } = render(<ChartStyle id="portfolio-chart" config={config} />)
      const styleElement = container.querySelector('style')
      
      expect(styleElement).toBeInTheDocument()
      expect(styleElement?.innerHTML).toContain('--color-revenue')
      expect(styleElement?.innerHTML).toContain('--color-expenses')
    })
  })
})
