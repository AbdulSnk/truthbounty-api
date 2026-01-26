import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RewardsModule } from './rewards/rewards.module';
import blockchainConfig from './config/blockchain.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { DisputeModule } from './dispute/dispute.module';
import { IdentityModule } from './identity/identity.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true,
      load: [blockchainConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'truthbounty',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // For development; use migrations in production
    }),
    BlockchainModule,
    DisputeModule,
    IdentityModule,
    PrismaModule,
     RewardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}