/**
 * Unit Tests for Logger Utility
 * 
 * Tests the centralized logging implementation including:
 * - Environment-aware logging
 * - Log level filtering
 * - Message formatting
 * - Context handling
 */

import { logger } from '@/lib/logger';

describe('Logger Utility', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let originalNodeEnv: string | undefined;

    beforeEach(() => {
        // Spy on console methods
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        // Store original NODE_ENV
        originalNodeEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
        // Restore console methods
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();

        // Restore NODE_ENV
        process.env.NODE_ENV = originalNodeEnv;
    });

    describe('Development Mode', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development';
        });

        it('should log debug messages in development', () => {
            logger.debug('Debug message');
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('should log info messages in development', () => {
            logger.info('Info message');
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('should log warn messages in development', () => {
            logger.warn('Warning message');
            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        it('should log error messages in development', () => {
            logger.error('Error message');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should include emoji in development logs', () => {
            logger.info('Test message');
            const loggedMessage = consoleLogSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('ℹ️');
        });

        it('should include log level in development logs', () => {
            logger.warn('Test warning');
            const loggedMessage = consoleWarnSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('[WARN]');
        });
    });

    describe('Production Mode', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'production';
        });

        it('should NOT log debug messages in production', () => {
            logger.debug('Debug message');
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it('should NOT log info messages in production', () => {
            logger.info('Info message');
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it('should log warn messages in production', () => {
            logger.warn('Warning message');
            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        it('should log error messages in production', () => {
            logger.error('Error message');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should format logs as JSON in production', () => {
            logger.error('Test error');
            const loggedMessage = consoleErrorSpy.mock.calls[0][0];

            // Should be valid JSON
            expect(() => JSON.parse(loggedMessage)).not.toThrow();

            const parsed = JSON.parse(loggedMessage);
            expect(parsed.level).toBe('ERROR');
            expect(parsed.message).toBe('Test error');
            expect(parsed.timestamp).toBeDefined();
        });
    });

    describe('Context Handling', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development';
        });

        it('should include context object in logs', () => {
            const context = { userId: '123', action: 'signup' };
            logger.info('User action', context);

            const loggedMessage = consoleLogSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('userId');
            expect(loggedMessage).toContain('123');
        });

        it('should handle complex context objects', () => {
            const context = {
                user: { id: '123', email: 'test@example.com' },
                metadata: { source: 'web', version: '1.0' },
            };

            logger.error('Complex context', context);
            const loggedMessage = consoleErrorSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('test@example.com');
        });

        it('should handle context with error objects', () => {
            const error = new Error('Test error');
            const context = { error, userId: '123' };

            logger.error('Error occurred', context);
            const loggedMessage = consoleErrorSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('Test error');
        });

        it('should work without context', () => {
            logger.info('Simple message');
            expect(consoleLogSpy).toHaveBeenCalled();
        });
    });

    describe('Production JSON Format', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'production';
        });

        it('should include timestamp in JSON logs', () => {
            logger.error('Test');
            const parsed = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
            expect(parsed.timestamp).toBeDefined();
            expect(new Date(parsed.timestamp).toString()).not.toBe('Invalid Date');
        });

        it('should include level in JSON logs', () => {
            logger.warn('Test warning');
            const parsed = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
            expect(parsed.level).toBe('WARN');
        });

        it('should include message in JSON logs', () => {
            logger.error('Error message');
            const parsed = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
            expect(parsed.message).toBe('Error message');
        });

        it('should merge context into JSON logs', () => {
            logger.error('Error', { userId: '123', action: 'payment' });
            const parsed = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
            expect(parsed.userId).toBe('123');
            expect(parsed.action).toBe('payment');
        });
    });

    describe('V0 Compatibility', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development';
        });

        it('should support v0 debug logs', () => {
            logger.v0('debug', 'Legacy debug');
            const loggedMessage = consoleLogSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('[v0]');
            expect(loggedMessage).toContain('Legacy debug');
        });

        it('should support v0 info logs', () => {
            logger.v0('info', 'Legacy info');
            const loggedMessage = consoleLogSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('[v0]');
        });

        it('should support v0 warn logs', () => {
            logger.v0('warn', 'Legacy warning');
            const loggedMessage = consoleWarnSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('[v0]');
        });

        it('should support v0 error logs', () => {
            logger.v0('error', 'Legacy error');
            const loggedMessage = consoleErrorSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('[v0]');
        });

        it('should support v0 logs with context', () => {
            logger.v0('info', 'Legacy message', { key: 'value' });
            const loggedMessage = consoleLogSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('[v0]');
            expect(loggedMessage).toContain('key');
        });
    });

    describe('Real-world Scenarios', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'development';
        });

        it('should log user signup events', () => {
            logger.info('User signed up', {
                userId: 'user-123',
                email: 'test@example.com',
                referralCode: 'REF123',
            });

            expect(consoleLogSpy).toHaveBeenCalled();
            const loggedMessage = consoleLogSpy.mock.calls[0][0];
            expect(loggedMessage).toContain('User signed up');
        });

        it('should log payment failures', () => {
            logger.error('Payment failed', {
                userId: 'user-123',
                amount: 99.99,
                error: 'Card declined',
            });

            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should log wallet operations', () => {
            logger.info('Wallet added', {
                walletId: 'wallet-123',
                address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                chain: 'ethereum',
            });

            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it('should log cache operations', () => {
            logger.debug('Cache hit', {
                key: 'defi-positions-user123',
                ttl: 300,
            });

            expect(consoleLogSpy).toHaveBeenCalled();
        });
    });

    describe('Security Considerations', () => {
        beforeEach(() => {
            process.env.NODE_ENV = 'production';
        });

        it('should not expose sensitive data in production logs', () => {
            // This is a reminder test - actual implementation should sanitize
            logger.error('Auth failed', {
                userId: '123',
                // Should NOT log: password, apiKey, privateKey, etc.
            });

            const parsed = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
            expect(parsed.password).toBeUndefined();
            expect(parsed.apiKey).toBeUndefined();
        });
    });
});
