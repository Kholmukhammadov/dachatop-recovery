import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { transliterate as tr, slugify } from 'transliteration';
import { PostsRepository } from '../../repositories/posts.repository';
import { Wp_posts } from '../../entities/wp_posts.entity';
import { PostMetaRepository } from '../../repositories/postmeta.repository';
import { Wp_postmeta } from '../../entities/wp_postmeta.entity';
import {
  PostModel,
  MetaOptionEnum,
  DefaultMetaEnum,
} from '../../models/post.model';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { TermsRepository } from '../../repositories/terms.repository';
import { TermsService } from '../terms/terms.service';
import { Wp_term_taxonomy } from '../../entities/wp_term_taxonomy.entity';
import { AbstarctModel } from '../../models/abstarct.model';
import { PostChildDTO } from '../../models/postChild.DTO';
import { Express } from 'express';
import { PostMetaService } from '../post-meta/post-meta.service';
import { CreatePostDTO } from '../../models/createPost.DTO';
import { Wp_term_relationships } from '../../entities/wp_term_relationships.entity';
import { TermRelationshipsRepository } from '../../repositories/term_relationship.repository,ts';
import { v2 } from 'cloudinary';
import { AuthService } from '../../../auth/auth.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostsRepository)
    private postsRepository: PostsRepository,
    private postMetaRepository: PostMetaRepository,
    private termRepository: TermsRepository,
    private termService: TermsService,
    private postMetaService: PostMetaService,
    private termRelationRepository: TermRelationshipsRepository,
    private userService: AuthService,
  ) {}
  async getPost(id: number): Promise<PostModel> {
    const post: Wp_posts = await this.postsRepository.getPostById(id);
    const postModel: PostModel = {};
    if (post) {
      postModel.post_parent = post;
      postModel.post_options = {};
      postModel.post_options.post_author = await this.userService.getUserPhone(
        post.post_author,
      );
      postModel.post_options.post_details =
        await this.postMetaRepository.getPostMetasByPostId(post.ID);
      postModel.post_options.post_state_options = await this.getState_options(
        post.ID,
      );
      postModel.post_child = await this.postsRepository.getPostChilds(post.ID);
    }
    return postModel;
  }

  async getAuthorPosts(
    authorId: number,
    options: IPaginationOptions,
  ): Promise<AbstarctModel<Wp_posts>> {
    const queryBuilder = this.postsRepository.createQueryBuilder('post');
    queryBuilder
      .where('post.post_author = :post_author', { post_author: authorId })
      .andWhere('post.post_parent = :post_parent', { post_parent: 0 })
      .andWhere('post.post_status = :post_status', { post_status: 'publish' })
      .andWhere('post.post_type = :post_type', { post_type: 'listing' });
    const response: AbstarctModel<Wp_posts> = {};
    await paginate<Wp_posts>(queryBuilder, options).then((value) => {
      response.items = value.items;
      response.meta = value.meta;
      response.links = value.links;
    });
    const posts: Wp_posts[] = response.items;
    const postModels: PostModel[] = [];
    if (posts.length > 0) {
      for (const post of posts) {
        const postModel: PostModel = {};
        postModel.post_parent = post;
        postModel.post_child = await this.postsRepository.getPostChilds(
          post.ID,
        );
        postModel.post_options = {};
        postModel.post_options.post_author =
          await this.userService.getUserPhone(post.post_author);
        postModel.post_options.post_details = await this.settingPostMetas(
          post.ID,
        );
        postModel.post_options.post_state_options = await this.getState_options(
          post.ID,
        );
        postModels.push(postModel);
      }
    }
    response.data = postModels;
    response.items = [];
    return response;
  }

  async getAll(
    options: IPaginationOptions,
    status: string,
    date?: string,
    featured?: number,
    taxonomy_id?: number,
  ): Promise<AbstarctModel<Wp_posts>> {
    if (this.termService.terms.length === 0) {
      this.termService.terms.push(...(await this.termService.getAllTerms()));
    }
    const response: AbstarctModel<Wp_posts> = {};
    if (!featured && !taxonomy_id && status !== 'pending') {
      const queryBuilder = this.postsRepository.createQueryBuilder('post');
      queryBuilder
        .where('post.post_parent = :post_parent', {
          post_parent: 0,
        })
        .andWhere('post.post_type = :post_type', {
          post_type: 'listing',
        })
        .andWhere('post.post_status = :post_status', {
          post_status: status,
        })
        .orderBy('post.post_date', 'DESC');
      if (date) {
        queryBuilder.andWhere('post.post_date like :post_date', {
          post_date: `%${date}%`,
        });
      }
      await paginate<Wp_posts>(queryBuilder, options).then((value) => {
        response.items = value.items;
        response.meta = value.meta;
        response.links = value.links;
      });
      const posts: Wp_posts[] = response.items;
      const postModels: PostModel[] = [];
      if (posts.length > 0) {
        for (const post of posts) {
          const postModel: PostModel = {};
          postModel.post_parent = post;
          postModel.post_child = await this.postsRepository.getPostChilds(
            post.ID,
          );
          postModel.post_options = {};
          postModel.post_options.post_author =
            await this.userService.getUserPhone(post.post_author);
          postModel.post_options.post_details = await this.settingPostMetas(
            post.ID,
            featured,
          );
          if (featured && postModel.post_options.post_details.length === 0) {
            continue;
          }
          postModel.post_options.post_state_options =
            await this.getState_options(post.ID);
          if (
            taxonomy_id &&
            postModel.post_options.post_state_options.length === 0
          ) {
            continue;
          }
          postModel.post_child = await this.postsRepository.getPostChilds(
            post.ID,
          );
          postModels.push(postModel);
        }
      }
      response.data = postModels;
      response.items = [];
    }
    if (featured || taxonomy_id || status === 'pending') {
      const postMetas: Wp_postmeta[] =
        await this.postMetaRepository.getPostMetasByFeatured(featured);
      const taxonomy_ids: Wp_term_relationships[] =
        await this.termRelationRepository.getRelationByTaxonomyId(taxonomy_id);
      let posts: Wp_posts[] = [];
      if (featured && taxonomy_id) {
        const IDs: number[] = [];
        if (postMetas.length <= taxonomy_ids.length) {
          postMetas.forEach((meta) => {
            IDs.push(meta.post_id);
          });
        } else {
          taxonomy_ids.forEach((tax) => {
            IDs.push(tax.object_id);
          });
        }
        posts.push(
          ...(await this.postsRepository.getPostByIdsAndFilter(
            IDs,
            status,
            date,
          )),
        );
        posts.push(
          ...(await this.postsRepository.getUnFeaturedPosts(IDs, status, date)),
        );
      }
      if (featured && !taxonomy_id) {
        posts.push(
          ...(await this.postsRepository.getPostByIdsAndFilter(
            postMetas.map((p) => p.post_id),
            status,
            date,
          )),
        );
        posts.push(
          ...(await this.postsRepository.getUnFeaturedPosts(
            postMetas.map((p) => p.post_id),
            status,
            date,
          )),
        );
      }
      if (taxonomy_id && !featured) {
        posts.push(
          ...(await this.postsRepository.getPostByIdsAndFilter(
            taxonomy_ids.map((tax) => tax.object_id),
            status,
            date,
          )),
        );
        posts.push(
          ...(await this.postsRepository.getUnFeaturedPosts(
            taxonomy_ids.map((tax) => tax.object_id),
            status,
            date,
          )),
        );
      }
      if (status === 'pending') {
        posts = await this.postsRepository.getPostsParents(status, date);
        posts = posts.reverse();
      }
      const postModels: PostModel[] = [];
      if (posts.length > 0) {
        let i = 0;
        for (const post of posts.filter(
          (post, index) =>
            index >= Number(options.limit) * (Number(options.page) - 1) &&
            index < Number(options.limit) * Number(options.page),
        )) {
          if (i === Number(options.limit)) {
            break;
          }
          const postModel: PostModel = {};
          postModel.post_parent = post;
          postModel.post_child = await this.postsRepository.getPostChilds(
            post.ID,
          );
          postModel.post_options = {};
          postModel.post_options.post_details = await this.settingPostMetas(
            post.ID,
            featured,
          );
          if (featured && postModel.post_options.post_details.length === 0) {
            continue;
          }
          postModel.post_options.post_state_options =
            await this.getState_options(post.ID);
          if (
            taxonomy_id &&
            postModel.post_options.post_state_options.length === 0
          ) {
            continue;
          }
          postModels.push(postModel);
          i++;
        }
      }
      response.meta = {
        totalItems: posts.length,
        currentPage: Number(options.page),
        itemCount: Number(options.limit),
        itemsPerPage: Number(options.limit),
        totalPages:
          posts.length % Number(options.limit) === 0
            ? Math.floor(posts.length / Number(options.limit))
            : Math.floor(posts.length / Number(options.limit)) + 1,
      };
      response.links = null;
      response.data = postModels;
      response.items = [];
    }
    return response;
  }

  private async settingPostMetas(
    post_id: number,
    featured?: number,
  ): Promise<Wp_postmeta[]> {
    const postMetas: Wp_postmeta[] =
      await this.postMetaRepository.getPostMetasByPostId(post_id, featured);
    return postMetas;
  }

  async getState_options(post_id: number): Promise<Wp_term_taxonomy[]> {
    return await this.termService.getStateOptionsOfPost(post_id);
  }

  async preparePostParentPayload(payload: CreatePostDTO): Promise<PostModel> {
    payload.post_parent.post_parent = 0;
    payload.post_parent.post_type = 'listing';
    payload.post_parent.comment_status = 'closed';
    payload.post_parent.ping_status = 'closed';
    payload.post_parent.menu_order = 0;
    payload.post_parent.comment_count = 0;
    payload.post_parent.post_status = 'pending';
    payload.post_parent.post_date = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    payload.post_parent.post_date_gmt = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    payload.post_parent.post_modified = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    payload.post_parent.post_modified_gmt = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    payload.post_parent.guid = 'https://dachatop.uz/?post_type=listing&#038;p=';
    payload.post_parent.post_name = slugify(payload.post_parent.post_title, {
      lowercase: true,
      replace: [[' #', '-']],
    });
    const postParent = await this.postsRepository.createPostParent(
      payload.post_parent,
    );
    let postChilds: Wp_posts[] = [];
    const files: Array<Express.Multer.File> = [];
    await Promise.all(
      payload.files.map(async (file) => {
        const re = await this.uploadImageToCloudinary(file);
        file.path = re.url;
        files.push(file);
      }),
    );
    if (postParent) {
      const postChild: PostChildDTO = {
        files: payload.files,
        post_parent: postParent.ID,
        post_title: postParent.post_title,
        author_id: postParent.post_author,
      };
      postChilds = await this.preparePostChildPayload(postChild);
    }
    let post_details: Wp_postmeta[] = [];
    if (postChilds.length > 0) {
      post_details = await this.postMetaService.preparePostMetasPayload(
        payload.post_metas,
        postParent.ID,
        postChilds
          .filter((ch) => {
            if (
              ch.post_parent === postParent.ID &&
              ch.post_type === 'attachment'
            ) {
              return ch.ID;
            }
          })
          .map((ch) => ch.ID),
      );
    }
    let post_state_options: Wp_term_relationships[] = [];
    if (postParent) {
      post_state_options = await this.termService.createRelations(
        postParent.ID,
        payload.taxonomyIds,
      );
    }
    let term_taxonomies: Wp_term_taxonomy[] = [];
    if (post_state_options.length > 0) {
      term_taxonomies = await this.termService.getStateOptionsOfPost(
        postParent.ID,
      );
    }
    const data: PostModel = {
      post_parent: postParent,
      post_child: postChilds,
      post_options: {
        post_details: post_details,
        post_state_options: term_taxonomies,
      },
    };
    return await data;
  }

  async preparePostChildPayload(payload: PostChildDTO): Promise<Wp_posts[]> {
    const postChilds: Wp_posts[] = [];
    await payload.files.forEach((file) => {
      const postChild: Wp_posts = {
        guid: `${file.path}`,
        post_mime_type: file.mimetype,
        post_parent: payload.post_parent,
        post_author: payload.author_id,
        post_title: file.filename.slice(0, file.filename.indexOf('.')),
        post_name: file.filename
          .slice(0, file.filename.indexOf('.'))
          .toLowerCase(),
        post_type: 'attachment',
        comment_status: 'open',
        ping_status: 'closed',
        post_status: 'inherit',
        menu_order: 0,
        comment_count: 0,
        post_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        post_date_gmt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        post_modified: new Date().toISOString().slice(0, 19).replace('T', ' '),
        post_modified_gmt: new Date()
          .toISOString()
          .slice(0, 19)
          .replace('T', ' '),
      };
      postChilds.push(postChild);
    });
    const revision = {
      guid: `http://dachatop.uz/${new Date().getFullYear()}/${new Date()
        .toISOString()
        .slice(5, 7)}/${new Date().getDate()}/${
        payload.post_parent
      }-revision-v1/`,
      post_mime_type: '',
      post_parent: payload.post_parent,
      post_author: payload.author_id,
      post_title: payload.post_title,
      post_name: `${payload.post_parent}-revision-v1`,
      post_type: 'revision',
      comment_status: 'closed',
      ping_status: 'closed',
      post_status: 'inherit',
      menu_order: 0,
      comment_count: 0,
      post_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      post_date_gmt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      post_modified: new Date().toISOString().slice(0, 19).replace('T', ' '),
      post_modified_gmt: new Date()
        .toISOString()
        .slice(0, 19)
        .replace('T', ' '),
    };
    postChilds.push(revision);
    return await this.postsRepository.createPostChilds(postChilds);
  }

  public async updatePost(payload: Wp_posts): Promise<Wp_posts> {
    const model: Wp_posts = await this.postsRepository.findOne(payload.ID);
    model.post_status = payload.post_status;
    model.post_modified_gmt = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    model.post_modified = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    return this.postsRepository.save(model);
  }
  public async uploadImageToCloudinary(
    file: Express.Multer.File,
  ): Promise<any> {
    v2.config({
      cloud_name: 'dachatop-uz',
      api_key: '461433557797928',
      api_secret: 'j2hv9zn-qBRFq84bJLuDvwcwPjM',
    });
    console.log(file.path, file.filename.slice(0, file.filename.indexOf('.')));
    const res = await v2.uploader.upload(
      file.path,
      { public_id: file.filename.slice(0, file.filename.indexOf('.')) },
      function (error, result) {
        return result;
      },
    );
    console.log(res);
    return res;
  }
}
