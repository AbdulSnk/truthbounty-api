import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from './entities/claim.entity';
import { Stake } from '../staking/entities/stake.entity';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { ClaimResolutionService } from './claim-resolution.service';
import { CacheModule } from '../cache/cache.module';
import { EvidenceIntegrityMiddleware } from "../common/middleware/evidence-integrity.middleware";

@Module({
    imports: [
        TypeOrmModule.forFeature([Claim, Stake]),
        CacheModule,
    ],
    controllers: [ClaimsController],
    providers: [ClaimsService, ClaimResolutionService],
    exports: [ClaimResolutionService, ClaimsService],
})
export class ClaimsModule { 
    configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EvidenceIntegrityMiddleware)
      .forRoutes("claims/upload-evidence");
  }
}
