import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClaimsCache {
    private readonly logger = new Logger(ClaimsCache.name);
    private readonly ttl: number;

    constructor(
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
    ) {
        // TTL is configurable via environment variable, defaults to 3600 seconds (1 hour)
        this.ttl = this.configService.get<number>('CACHE_CLAIMS_TTL', 3600);
    }

    /**
     * Generates a key for a specific claim by its ID
     */
    private getClaimKey(id: string): string {
        return `claim:${id}`;
    }

    /**
     * Generates a key for the latest claims list
     */
    private getLatestClaimsKey(): string {
        return 'claims:latest';
    }

    /**
     * Generates a key for claims associated with a specific user wallet
     */
    private getUserClaimsKey(wallet: string): string {
        return `claims:user:${wallet.toLowerCase()}`;
    }

    /**
     * Retrieves a claim from cache
     */
    async getClaim(id: string): Promise<any | null> {
        const data = await this.redisService.get(this.getClaimKey(id));
        if (data) {
            this.logger.debug(`Cache hit for claim:${id}`);
            try {
                return JSON.parse(data);
            } catch (e) {
                this.logger.error(`Failed to parse cached claim ${id}: ${e.message}`);
                return null;
            }
        }
        this.logger.debug(`Cache miss for claim:${id}`);
        return null;
    }

    /**
     * Stores a claim in cache
     */
    async setClaim(id: string, claim: any): Promise<void> {
        await this.redisService.set(this.getClaimKey(id), JSON.stringify(claim), this.ttl);
        this.logger.debug(`Cached claim:${id}`);
    }

    /**
     * Retrieves the list of latest claims from cache
     */
    async getLatestClaims(): Promise<any[] | null> {
        const data = await this.redisService.get(this.getLatestClaimsKey());
        if (data) {
            this.logger.debug('Cache hit for claims:latest');
            try {
                return JSON.parse(data);
            } catch (e) {
                this.logger.error(`Failed to parse cached latest claims: ${e.message}`);
                return null;
            }
        }
        this.logger.debug('Cache miss for claims:latest');
        return null;
    }

    /**
     * Stores the list of latest claims in cache
     */
    async setLatestClaims(claims: any[]): Promise<void> {
        await this.redisService.set(this.getLatestClaimsKey(), JSON.stringify(claims), this.ttl);
        this.logger.debug('Cached claims:latest');
    }

    /**
     * Retrieves claims for a specific user from cache
     */
    async getUserClaims(wallet: string): Promise<any[] | null> {
        const data = await this.redisService.get(this.getUserClaimsKey(wallet));
        if (data) {
            this.logger.debug(`Cache hit for claims:user:${wallet}`);
            try {
                return JSON.parse(data);
            } catch (e) {
                this.logger.error(`Failed to parse cached user claims for ${wallet}: ${e.message}`);
                return null;
            }
        }
        this.logger.debug(`Cache miss for claims:user:${wallet}`);
        return null;
    }

    /**
     * Stores user claims in cache
     */
    async setUserClaims(wallet: string, claims: any[]): Promise<void> {
        await this.redisService.set(this.getUserClaimsKey(wallet), JSON.stringify(claims), this.ttl);
        this.logger.debug(`Cached claims:user:${wallet}`);
    }

    /**
     * Invalidates claim cache and dependent lists
     * Should be called on update/delete
     */
    async invalidateClaim(id: string, userWallet?: string): Promise<void> {
        const promises = [
            this.redisService.del(this.getClaimKey(id)),
            this.redisService.del(this.getLatestClaimsKey()),
        ];

        if (userWallet) {
            promises.push(this.redisService.del(this.getUserClaimsKey(userWallet)));
        }

        await Promise.all(promises);
        this.logger.debug(`Invalidated cache for claim:${id} and related lists`);
    }

    /**
     * Invalidates only user-specific claims cache
     */
    async invalidateUserClaims(wallet: string): Promise<void> {
        await this.redisService.del(this.getUserClaimsKey(wallet));
        this.logger.debug(`Invalidated cache for claims:user:${wallet}`);
    }
}
