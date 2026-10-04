import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ROLES } from '../auth/authorization.constants';
import { WorkService } from './work.service';

describe('WorkService geolocation', () => {
  let service: WorkService;
  let workRepository: any;
  let userRepository: any;
  let companyRepository: any;

  const caller = {
    sub: 7,
    role: ROLES.EMPLOYEE,
    empresa_id: 3,
  };

  const point = {
    entrada: '08:00:00',
    saida: '17:00:00',
    data_ponto: '2026-10-04',
    latitude: -23.55052,
    longitude: -46.633308,
  };

  beforeEach(() => {
    workRepository = {
      create: jest.fn((work) => work),
      save: jest.fn(async (work) => work),
      findOne: jest.fn<() => Promise<any>>().mockResolvedValue(null),
    };
    userRepository = {
      findOne: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 7, empresa_id: 3 }),
    };
    companyRepository = {
      findOne: jest.fn<() => Promise<any>>().mockResolvedValue({
        id: 3,
        latitude: -23.55052,
        longitude: -46.633308,
      }),
    };

    service = new WorkService(
      workRepository as any,
      userRepository as any,
      companyRepository as any,
    );
  });

  it('saves a point inside the company radius with its coordinates', async () => {
    const response = await service.create(point, caller);

    expect(workRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        fk_id_func: caller.sub,
        latitude_registro: point.latitude,
        longitude_registro: point.longitude,
        total_dia: '09:00:00',
      }),
    );
    expect(response.status).toBe('success');
  });

  it('accepts an employee role without accent and still rejects admins', async () => {
    const response = await service.create(point, { ...caller, role: 'Funcionario' });

    expect(response.status).toBe('success');
    await expect(
      service.create(point, { ...caller, role: 'Administrador' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects a point outside the company radius without saving it', async () => {
    await expect(
      service.create({ ...point, latitude: -23.548 }, caller),
    ).rejects.toThrow(ForbiddenException);

    expect(workRepository.save).not.toHaveBeenCalled();
  });

  it('rejects an exit outside the company radius without updating the record', async () => {
    workRepository.findOne.mockResolvedValue({
      pk_id_ponto: 9,
      fk_id_func: caller.sub,
      entrada: '08:00:00',
      saida: '08:00:00',
      data_ponto: new Date('2026-10-04'),
      total_dia: '00:00:00',
    });

    await expect(
      service.update(9, { saida: '17:00:00', latitude: -23.548, longitude: point.longitude }, caller),
    ).rejects.toThrow(ForbiddenException);

    expect(workRepository.save).not.toHaveBeenCalled();
  });
});