export class CreateWorkDto {
  userId: number;
  companyId: number;
  checkIn: Date;
  checkOut: Date;
  hoursWorked: number;
  notes: string;
}
