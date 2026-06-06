import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { WorkService } from './work.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


// todas as rotas exigem um token JWT válido para acesso
@UseGuards(JwtAuthGuard)
@Controller('work')
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  @Get()
  findAll(@Req() req) {
    return this.workService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.workService.findOne(+id, req.user);
  }

  @Post()
  create(@Body() createWorkDto: CreateWorkDto, @Req() req) {
    return this.workService.create(createWorkDto, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateWorkDto, @Req() req) {
    return this.workService.update(+id, updateDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.workService.remove(+id, req.user);
  }
}
