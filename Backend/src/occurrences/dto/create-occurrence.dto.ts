export class CreateOccurrenceDto {
  title: string;
  description: string;
  type: string;
  severity: string;
  reportedById: number;
  companyId: number;
  occurredAt: Date;
}
