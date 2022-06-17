import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Homey_mapRepository } from '../../repositories/homey_map.repository';
import { Wp_homey_map } from '../../entities/wp_homey_map.entity';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(Homey_mapRepository)
    private usersRepository: Homey_mapRepository,
  ) {}
  async getListingMap(listingId): Promise<Wp_homey_map> {
    return this.usersRepository.getMapByListingId(listingId);
  }

  async getMap(id): Promise<Wp_homey_map> {
    return this.usersRepository.getMapById(id);
  }
}
