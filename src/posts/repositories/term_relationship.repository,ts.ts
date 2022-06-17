import { Repository, EntityRepository } from 'typeorm';
import { Wp_homey_map } from '../entities/wp_homey_map.entity';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Wp_term_relationships } from '../entities/wp_term_relationships.entity';

@EntityRepository(Wp_term_relationships)
export class TermRelationshipsRepository extends Repository<Wp_term_relationships> {
  async getTermRelationshipByObjectId(
    object_id: number,
  ): Promise<Wp_term_relationships[]> {
    return await this.find({
      where: {
        object_id: object_id,
      },
    });
  }
  async getTermRelationshipByTermTaxonomyId(
    taxonomy_id: number,
  ): Promise<Wp_term_relationships[]> {
    return await this.find({
      where: {
        term_taxonomy_id: taxonomy_id,
      },
    });
  }
  async createRelationShips(
    post_parent: number,
    taxonomy_ids: number[],
  ): Promise<Wp_term_relationships[]> {
    const relationship: Wp_term_relationships[] = [];
    await taxonomy_ids.forEach((taxonomy_id) => {
      const relation: Wp_term_relationships = {
        object_id: post_parent,
        term_taxonomy_id: taxonomy_id,
        term_order: 0,
      };
      relationship.push(relation);
    });
    return await this.save(relationship);
  }
  public async getRelationByTaxonomyId(
    id: number,
  ): Promise<Wp_term_relationships[]> {
    if (!id) {
      return [];
    }
    return this.find({
      where: {
        term_taxonomy_id: id,
      },
    });
  }
}
