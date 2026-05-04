import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { OccurrencesService } from './occurrences.service';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';

@Controller('occurrences')
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @Get()
  findAll() {
    return this.occurrencesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.occurrencesService.findOne(+id);
  }

  @Post()
  create(@Body() createOccurrenceDto: CreateOccurrenceDto) {
    return this.occurrencesService.create(createOccurrenceDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateOccurrenceDto>) {
    return this.occurrencesService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.occurrencesService.remove(+id);
  }
}
