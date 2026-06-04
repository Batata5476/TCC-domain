import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { WellbeingService } from './wellbeing.service';
import { CreateWellbeingDto } from './dto/create-wellbeing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('wellbeing')
export class WellbeingController {
  constructor(private readonly wellbeingService: WellbeingService) {}

  @Get()
  findAll(@Req() req) {
    return this.wellbeingService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.wellbeingService.findOne(+id, req.user);
  }

  @Post()
  create(@Body() createWellbeingDto: CreateWellbeingDto, @Req() req) {
    return this.wellbeingService.create(createWellbeingDto, req.user);
  }
}
