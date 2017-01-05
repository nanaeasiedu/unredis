import service from './service';
import unredis from './unredis';

export default {
  UnRedisAPI: unredis(service)
};
