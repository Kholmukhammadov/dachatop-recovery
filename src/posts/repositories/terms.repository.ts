import { Repository, EntityRepository } from 'typeorm';
import { Wp_homey_map } from '../entities/wp_homey_map.entity';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Wp_terms } from '../entities/wp_terms.entity';

@EntityRepository(Wp_terms)
export class TermsRepository extends Repository<Wp_terms> {
  async getTermById(term_id: number): Promise<Wp_terms> {
    return await this.findOne(term_id);
  }

  async getTerms(): Promise<Wp_terms[]> {
    return await this.find();
  }
}
