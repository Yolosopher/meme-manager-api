import { Controller, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {}
