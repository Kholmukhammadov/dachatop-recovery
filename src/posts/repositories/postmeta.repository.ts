import { EntityRepository, Repository } from 'typeorm';
import { Wp_postmeta } from '../entities/wp_postmeta.entity';
import * as PhpSerializer from 'php-serialize';

@EntityRepository(Wp_postmeta)
export class PostMetaRepository extends Repository<Wp_postmeta> {
  async getPostMetaById(id: number): Promise<Wp_postmeta> {
    const post = await this.findOne(id);
    return post;
  }

  async getPostMetasByPostId(
    post_id: number,
    featured?: number,
  ): Promise<Wp_postmeta[]> {
    let postMetas: Wp_postmeta[] = await this.find({
      where: {
        post_id: post_id,
      },
    });
    if (featured) {
      if (
        Number(
          postMetas[
            postMetas.findIndex((meta) => (meta.meta_key = 'homey_featured'))
          ].meta_value,
        ) !== 1
      ) {
        postMetas = [];
      }
    }
    if (postMetas.length > 0) {
      const accomodationIndex: number = postMetas.findIndex(
        (postMeta) =>
          postMeta.meta_key == 'homey_accomodation' &&
          postMeta.meta_value.length > 5,
      );
      const servicesIndex: number = postMetas.findIndex(
        (postMeta) =>
          postMeta.meta_key == 'homey_services' &&
          postMeta.meta_value.length > 5,
      );
      const reservationIndex: number = postMetas.findIndex(
        (postMeta) =>
          postMeta.meta_key == 'reservation_unavailable' &&
          postMeta.meta_value.length > 5,
      );
      if (accomodationIndex >= 0) {
        postMetas[accomodationIndex].meta_value = JSON.parse(
          JSON.stringify(
            PhpSerializer.unserialize(postMetas[accomodationIndex].meta_value),
          ),
        );
      }
      if (servicesIndex >= 0) {
        postMetas[servicesIndex].meta_value = JSON.parse(
          JSON.stringify(
            PhpSerializer.unserialize(postMetas[servicesIndex].meta_value),
          ),
        );
      }
      if (reservationIndex >= 0) {
        const time: number[] = Object.keys(
          PhpSerializer.unserialize(postMetas[reservationIndex].meta_value),
        ).map((value) => {
          return Number(value + '000');
        });
        postMetas[reservationIndex].meta_value = JSON.parse(
          JSON.stringify(time),
        );
      }
    }
    return postMetas;
  }
  async createPostMetas(post_metas: Wp_postmeta[]): Promise<Wp_postmeta[]> {
    if (
      post_metas.length === 1 &&
      post_metas[0].meta_key === 'reservation_unavailable'
    ) {
      const time: number[] = JSON.parse(
        JSON.stringify(post_metas[0].meta_value),
      );
      const obj = {};
      time.forEach((value) => {
        const key = value.toString().slice(0, value.toString().length - 3);
        const temp = { [key]: post_metas[0].post_id };
        Object.assign(obj, temp);
      });
      post_metas[0].meta_value = PhpSerializer.serialize(obj);
      return await this.save(post_metas);
    }
    const postMetasToCreate: Wp_postmeta[] = await this.checkPostMetaForExist(
      post_metas,
    );
    return await this.save(postMetasToCreate);
  }

  async checkPostMetaForExist(
    post_metas: Wp_postmeta[],
  ): Promise<Wp_postmeta[]> {
    const post_MetasToCreate: Wp_postmeta[] = [];
    await Promise.all(
      post_metas.map(async (post_meta) => {
        const toUpdate: Wp_postmeta = await this.findOne({
          post_id: post_meta.post_id,
          meta_key: post_meta.meta_key,
        });
        if (!toUpdate) {
          post_MetasToCreate.push(post_meta);
        } else {
          toUpdate.meta_value = post_meta.meta_value;
          post_MetasToCreate.push(toUpdate);
        }
      }),
    );
    return await post_MetasToCreate;
  }
  public async getPostMetasByFeatured(
    featured: number,
  ): Promise<Wp_postmeta[]> {
    if (!featured) {
      return [];
    }
    return this.find({
      where: {
        meta_key: 'homey_featured',
        meta_value: featured,
      },
    });
  }
}
