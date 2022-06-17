import { Injectable } from '@nestjs/common';
import { TermTaxonomyRepository } from '../../repositories/term_taxonomy.repository';
import { TermRelationshipsRepository } from '../../repositories/term_relationship.repository,ts';
import { TermsRepository } from '../../repositories/terms.repository';
import { Wp_terms } from '../../entities/wp_terms.entity';
import { Wp_term_relationships } from '../../entities/wp_term_relationships.entity';
import { PostModel } from '../../models/post.model';
import { Wp_term_taxonomy } from '../../entities/wp_term_taxonomy.entity';

@Injectable()
export class TermsService {
  public terms: Wp_terms[] = [];
  constructor(
    private termRelationRepository: TermRelationshipsRepository,
    private termTaxonomyRepository: TermTaxonomyRepository,
    private termsRepository: TermsRepository,
  ) {}
  async getStateOptionsOfPost(object_id: number): Promise<Wp_term_taxonomy[]> {
    const termRelations: Wp_term_relationships[] =
      await this.termRelationRepository.getTermRelationshipByObjectId(
        object_id,
      );
    const taxonomy_ids: number[] = termRelations.map((r) => r.term_taxonomy_id);
    let taxonomies: Wp_term_taxonomy[] = [];
    if (taxonomy_ids.length > 0) {
      // for (const termRelation of termRelations) {
      //   const taxonomy: Wp_term_taxonomy = await this.getTermByTaxonomyId(
      //     termRelation.term_taxonomy_id,
      //   );
      //   taxonomies.push(taxonomy);
      // }
      taxonomies = await this.getTermsByTaxonomyIds(taxonomy_ids);
    }
    return taxonomies;
  }

  async getTermByTaxonomyId(
    term_taxonomy_id: number,
  ): Promise<Wp_term_taxonomy> {
    const taxonomy: Wp_term_taxonomy =
      await this.termTaxonomyRepository.getTermTaxonomyById(term_taxonomy_id);
    taxonomy.term = await this.termsRepository.getTermById(taxonomy.term_id);
    return taxonomy;
  }

  async getTermsByTaxonomyIds(
    term_taxonomy_ids: number[],
  ): Promise<Wp_term_taxonomy[]> {
    const taxonomies: Wp_term_taxonomy[] =
      await this.termTaxonomyRepository.getTermTaxonomyByIds(term_taxonomy_ids);
    taxonomies.forEach((t, index) => {
      taxonomies[index].term = this.terms.find(
        (term) => term.term_id === t.term_taxonomy_id,
      );
    });
    return taxonomies;
  }

  async getAllTaxonomy(quantity: number): Promise<Wp_term_taxonomy[]> {
    const termTaxonomy: Wp_term_taxonomy[] =
      await this.termTaxonomyRepository.getTermTaxonomies(quantity);
    const responseTaxonomy: Wp_term_taxonomy[] = [];
    await Promise.all(
      termTaxonomy.map(async (taxonomy) => {
        taxonomy.term = await this.termsRepository.getTermById(
          taxonomy.term_id,
        );
        responseTaxonomy.push(taxonomy);
      }),
    );
    return responseTaxonomy;
  }

  async createRelations(
    post_parent: number,
    taxonomyIDs: number[],
  ): Promise<Wp_term_relationships[]> {
    return await this.termRelationRepository.createRelationShips(
      post_parent,
      taxonomyIDs,
    );
  }
  async getAllTerms(): Promise<Wp_terms[]> {
    return await this.termsRepository.getTerms();
  }
}
