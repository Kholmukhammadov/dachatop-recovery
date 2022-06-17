import { Repository, EntityRepository } from 'typeorm';
import { Wp_homey_map } from '../entities/wp_homey_map.entity';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

@EntityRepository(Wp_homey_map)
export class Homey_mapRepository extends Repository<Wp_homey_map> {
  async getMapByListingId(listingId: number): Promise<Wp_homey_map> {
    return await this.findOne({
      where: {
        listing_id: listingId,
      },
    });
  }
  async getMapById(id: number): Promise<Wp_homey_map> {
    return await this.findOne(id);
  }
}
