import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { ClaimsService } from './claims.service';

@Controller('claims')
export class ClaimsController {
    constructor(private readonly claimsService: ClaimsService) { }

    @Get('latest')
    async getLatest(@Query('limit') limit?: number) {
        return this.claimsService.findLatest(limit ? +limit : 10);
    }

    @Get('user/:wallet')
    async getByUser(@Param('wallet') wallet: string) {
        return this.claimsService.findByUser(wallet);
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.claimsService.findOne(id);
    }

    @Post()
    async createOne(@Body() data: any) {
        return this.claimsService.createClaim(data);
    }
}
