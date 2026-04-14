export class Meeting {
  id: number;
  title: string;
  description: string;
  scheduledAt: Date;
  organizerId: number;
  companyId: number;
  participants: number[];
  createdAt: Date;
}
