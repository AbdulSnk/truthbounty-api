import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardRefreshJob } from './leaderboard.refresh.job';
import { RedisProvider } from '../../redis/redis.provider';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [LeaderboardController],
  providers: [
    LeaderboardService,
    LeaderboardRefreshJob,
    RedisProvider,
  ],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}