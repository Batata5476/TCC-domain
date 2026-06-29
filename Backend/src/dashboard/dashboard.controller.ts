import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('company')
  async getCompanyDashboard(@Req() req) {
    // empresa_id identifies the company in the new unified JWT
    return this.dashboardService.getCompanyDashboard(req.user.empresa_id);
  }

  @Get('user')
  async getUserDashboard(@Req() req) {
    // sub is the user's ID in the new unified JWT
    return this.dashboardService.getUserDashboard(req.user.sub);
  }
}
