import { Module, Global } from '@nestjs/common';
import { ClaimsCache } from './claims.cache';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
    imports: [RedisModule],
    providers: [ClaimsCache],
    exports: [ClaimsCache],
})
export class CacheModule { }
