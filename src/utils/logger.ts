import loglevel from 'loglevel';
import { DEFAULT_LOG_LEVEL } from '~/constants';

const logger = loglevel.getLogger('_exits_logger_');
logger.setDefaultLevel(DEFAULT_LOG_LEVEL);

export default logger;
