export class CreateMeetingDto {
  title: string;
  description: string;
  scheduledAt: Date;
  organizerId: number;
  companyId: number;
  participants: number[];
}
