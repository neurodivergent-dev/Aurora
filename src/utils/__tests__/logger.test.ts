import logger from '../logger';

// Mock react-native-logs
jest.mock('react-native-logs', () => {
  const mockLog = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  return {
    logger: {
      createLogger: jest.fn(() => mockLog),
    },
    consoleTransport: jest.fn(),
  };
});

describe('AuroraLogger', () => {
  const { logger: rnLogs } = require('react-native-logs');
  const mockLog = rnLogs.createLogger();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log info with tag', () => {
    logger.info('test message', 'TestTag');
    expect(mockLog.info).toHaveBeenCalledWith('[TestTag] test message');
  });

  it('should log warn without tag', () => {
    logger.warn('test warning');
    expect(mockLog.warn).toHaveBeenCalledWith('test warning');
  });

  it('should log error with tag', () => {
    logger.error('test error', 'ErrorTag');
    expect(mockLog.error).toHaveBeenCalledWith('[ErrorTag] test error');
  });

  it('should log debug with tag', () => {
    logger.debug('test debug', 'DebugTag');
    expect(mockLog.debug).toHaveBeenCalledWith('[DebugTag] test debug');
  });
});
