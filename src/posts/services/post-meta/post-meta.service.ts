import { Injectable } from '@nestjs/common';
import { PostMetaRepository } from '../../repositories/postmeta.repository';
import { Wp_postmeta } from '../../entities/wp_postmeta.entity';
import * as PHPUnserializer from 'php-unserialize';
import { Wp_posts } from '../../entities/wp_posts.entity';
import * as PhpSerializer from 'php-serialize';
import {
  DefaultMetaEnum,
  DefaultMetaEnumValue,
  MetaOptionEnum,
  PostModel,
} from '../../models/post.model';
@Injectable()
export class PostMetaService {
  constructor(private postMetaRepository: PostMetaRepository) {}

  async getPostMetas(post_id: number): Promise<Wp_postmeta[]> {
    return await this.postMetaRepository.getPostMetasByPostId(post_id);
  }

  async getPostMeta(id: number): Promise<Wp_postmeta> {
    const postMeta: Wp_postmeta = await this.postMetaRepository.getPostMetaById(
      id,
    );
    postMeta.meta_value = JSON.stringify(
      PHPUnserializer.unserialize(postMeta.meta_value),
    );
    return postMeta;
  }
  async preparePostMetasPayload(
    post_metas: Wp_postmeta[],
    post_id: number,
    post_childs?: number[],
  ): Promise<Wp_postmeta[]> {
    const PostMetas: Wp_postmeta[] = [];
    let exist = false;
    await this.postMetaRepository.find({ post_id: post_id }).then((value) => {
      if (value.length > 0) {
        exist = true;
      }
    });
    if (!exist) {
      for (let i = 1; i <= 10; i++) {
        const postMeta: Wp_postmeta = {
          post_id: post_id,
          meta_key: Object.values(DefaultMetaEnum)[i],
          meta_value: Object.values(DefaultMetaEnumValue)[i],
        };
        PostMetas.push(postMeta);
      }
    }
    await Promise.all(
      post_metas.map(async (post_meta: Wp_postmeta) => {
        if (
          (post_meta.meta_key === 'homey_accomodation' ||
            post_meta.meta_key === 'homey_services' ||
            post_meta.meta_key === 'reservation_unavailable') &&
          post_meta.meta_value.length > 0
        ) {
          post_meta.meta_value = PhpSerializer.serialize(post_meta.meta_value);
        }
        const postMeta: Wp_postmeta = {
          post_id: post_id,
          meta_key: post_meta.meta_key,
          meta_value: post_meta.meta_value,
        };
        PostMetas.push(postMeta);
      }),
    );
    for (const child of post_childs) {
      PostMetas.push({
        post_id: post_id,
        meta_key: String(MetaOptionEnum.IMAGE_ID),
        meta_value: String(child),
      });
    }
    const response: Wp_postmeta[] = await this.createPostMetas(PostMetas);
    if (response.length > 0) {
      const accomodationIndex: number = response.findIndex(
        (postMeta) =>
          postMeta.meta_key == 'homey_accomodation' &&
          postMeta.meta_value.length > 5,
      );
      const servicesIndex: number = response.findIndex(
        (postMeta) =>
          postMeta.meta_key == 'homey_services' &&
          postMeta.meta_value.length > 5,
      );
      const reservationIndex: number = response.findIndex(
        (postMeta) =>
          postMeta.meta_key == 'reservation_unavailable' &&
          postMeta.meta_value.length > 5,
      );
      if (accomodationIndex >= 0) {
        response[accomodationIndex].meta_value = PhpSerializer.unserialize(
          response[accomodationIndex].meta_value,
        );
      }
      if (servicesIndex >= 0) {
        response[servicesIndex].meta_value = PhpSerializer.unserialize(
          response[accomodationIndex].meta_value,
        );
      }
      if (reservationIndex >= 0) {
        response[reservationIndex].meta_value = PhpSerializer.unserialize(
          response[accomodationIndex].meta_value,
        );
      }
    }
    return await response;
  }
  async createPostMetas(post_metas: Wp_postmeta[]): Promise<Wp_postmeta[]> {
    return await this.postMetaRepository.createPostMetas(post_metas);
  }
  async getSerilize(s: any): Promise<any> {
    const obj = {
      value: JSON.parse(JSON.stringify(PhpSerializer.unserialize(s))),
    };
    return obj;
  }

  async updatePostMeta(postmeta: Wp_postmeta): Promise<Wp_postmeta> {
    const model: Wp_postmeta = await this.postMetaRepository.findOne({
      post_id: postmeta.post_id,
      meta_key: postmeta.meta_key,
    });
    if (model) {
      if (
        model.meta_key === 'homey_accomodation' ||
        model.meta_key === 'homey_services' ||
        model.meta_key === 'reservation_unavailable'
      ) {
        if (model.meta_key === 'reservation_unavailable') {
          let time: number[];
          if (typeof postmeta.meta_value === 'string') {
            time = JSON.parse(postmeta.meta_value);
          } else {
            time = postmeta.meta_value;
          }
          const obj = {};
          time.forEach((value) => {
            const key = value.toString().slice(0, value.toString().length - 3);
            const temp = { [key]: model.post_id };
            Object.assign(obj, temp);
          });
          model.meta_value = PhpSerializer.serialize(obj);
        } else {
          model.meta_value = PhpSerializer.serialize(
            JSON.parse(postmeta.meta_value),
          );
        }
      } else {
        model.meta_value = postmeta.meta_value;
      }
      const response = await this.postMetaRepository.save(model);
      if (
        model.meta_key === 'homey_accomodation' ||
        model.meta_key === 'homey_services' ||
        model.meta_key === 'reservation_unavailable'
      ) {
        response.meta_value = PhpSerializer.unserialize(response.meta_value);
      }
      return response;
    } else {
      return await this.createPostMetas([postmeta])[0];
    }
  }
}
