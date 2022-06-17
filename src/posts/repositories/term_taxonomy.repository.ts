import { Repository, EntityRepository } from 'typeorm';
import { Wp_homey_map } from '../entities/wp_homey_map.entity';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Wp_term_taxonomy } from '../entities/wp_term_taxonomy.entity';
import {Wp_terms} from "../entities/wp_terms.entity";
import { In } from 'typeorm'

@EntityRepository(Wp_term_taxonomy)
export class TermTaxonomyRepository extends Repository<Wp_term_taxonomy> {
  async getTermTaxonomyById(taxonomy_id: number): Promise<Wp_term_taxonomy> {
    return await this.findOne(taxonomy_id);
  }

  async getTermTaxonomyByIds(
    taxonomy_ids: number[],
  ): Promise<Wp_term_taxonomy[]> {
    return await this.find({
      where: {
        term_taxonomy_id: In(taxonomy_ids),
      },
    });
  }

  async getTermTaxonomies(quantity: number): Promise<Wp_term_taxonomy[]> {
    return await this.find({
      order: {
        term_taxonomy_id: 'ASC',
      },
      take: quantity,
    });
  }
}
