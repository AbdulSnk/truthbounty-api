import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LeaderboardService } from './leaderboard.service';
import { LEADERBOARD_REFRESH_CRON } from './leaderboard.constants';

@Injectable()
export class LeaderboardRefreshJob {
  constructor(
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @Cron(LEADERBOARD_REFRESH_CRON)
  async refreshLeaderboard() {
    console.log('Refreshing leaderboards...');

    // ⚠️ Replace this with real DB query
    const usersFromDB = await this.fetchUsersFromDatabase();

    // Clear old rankings
    await this.leaderboardService.clearLeaderboard('global');
    await this.leaderboardService.clearLeaderboard('weekly');

    // Rebuild rankings
    for (const user of usersFromDB) {
      await this.leaderboardService.updateScore(
        user.id,
        user.reputation,
      );
    }

    console.log('Leaderboard refreshed successfully');
  }

  // Replace with actual DB call
  private async fetchUsersFromDatabase() {
    return [
      { id: 'user1', reputation: 150 },
      { id: 'user2', reputation: 300 },
      { id: 'user3', reputation: 200 },
    ];
  }
}