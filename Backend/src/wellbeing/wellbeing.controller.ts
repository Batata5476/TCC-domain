import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { WellbeingService } from './wellbeing.service';
import { CreateWellbeingDto } from './dto/create-wellbeing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// todas as rotas exigem um token JWT válido para acesso
@UseGuards(JwtAuthGuard)
@Controller('wellbeing')
export class WellbeingController {
  constructor(private readonly wellbeingService: WellbeingService) {}

  @Get()
  findAll() {
    return this.wellbeingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wellbeingService.findOne(+id);
  }

  @Post()
  create(@Body() createWellbeingDto: CreateWellbeingDto) {
    return this.wellbeingService.create(createWellbeingDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateWellbeingDto>) {
    return this.wellbeingService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wellbeingService.remove(+id);
  }
}
