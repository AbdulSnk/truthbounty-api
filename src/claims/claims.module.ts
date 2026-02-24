import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from './entities/claim.entity';
import { Evidence } from './entities/evidence.entity';
import { EvidenceVersion } from './entities/evidence-version.entity';
import { Stake } from '../staking/entities/stake.entity';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { ClaimResolutionService } from './claim-resolution.service';
import { EvidenceService } from './evidence.service';
import { CacheModule } from '../cache/cache.module';
import { EvidenceIntegrityMiddleware } from "../common/middleware/evidence-integrity.middleware";

@Module({
    imports: [
        TypeOrmModule.forFeature([Claim, Evidence, EvidenceVersion, Stake]),
        CacheModule,
    ],
    controllers: [ClaimsController],
    providers: [ClaimsService, ClaimResolutionService, EvidenceService],
    exports: [ClaimResolutionService, ClaimsService, EvidenceService],
})
export class ClaimsModule { 
    configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(EvidenceIntegrityMiddleware)
      .forRoutes("claims/upload-evidence");
  }
}
