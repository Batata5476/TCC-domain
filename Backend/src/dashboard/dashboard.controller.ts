import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('company')
  async getCompanyDashboard(@Req() req) {
    // O id da empresa está no sub do token (PK_COD_EMPRESA)
    return this.dashboardService.getCompanyDashboard(req.user.userId);
  }
}
