import { IsInt, Min, Max } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsInt()
  @Min(1)
  @Max(4)
  status: number;
}
