import {EntityRepository, In, Like, Not, Repository} from 'typeorm';
import { Wp_posts } from '../entities/wp_posts.entity';

@EntityRepository(Wp_posts)
export class PostsRepository extends Repository<Wp_posts> {
  async getPostById(id: number): Promise<Wp_posts> {
    return await this.findOne(id);
  }

  async getPostsByAuthorId(id: number): Promise<Wp_posts[]> {
    return await this.find({
      where: {
        post_author: id,
        post_parent: 0,
      },
    });
  }

  async getPostsParents(status: string, date?: string): Promise<Wp_posts[]> {
    if (date) {
      return await this.find({
        where: {
          post_type: 'listing',
          post_parent: 0,
          post_status: status,
          post_date: Like(`%${date}%`),
        },
      });
    }
    return await this.find({
      where: {
        post_type: 'listing',
        post_parent: 0,
        post_status: status,
      },
    });
  }

  async getPostByIdsAndFilter(
    ids: number[],
    status?: string,
    date?: string,
  ): Promise<Wp_posts[]> {
    if (date) {
      return await this.find({
        where: {
          ID: In(ids),
          post_type: 'listing',
          post_parent: 0,
          post_status: status,
          post_date: Like(`%${date}%`),
        },
        order: {
          post_date: 'DESC',
        },
      });
    }
    return await this.find({
      where: {
        ID: In(ids),
        post_type: 'listing',
        post_parent: 0,
        post_status: status,
      },
      order: {
        post_date: 'DESC',
      },
    });
  }

  async getUnFeaturedPosts(
    ids: number[],
    status?: string,
    date?: string,
  ): Promise<Wp_posts[]> {
    if (date) {
      return await this.find({
        where: {
          ID: Not(In(ids)),
          post_type: 'listing',
          post_parent: 0,
          post_status: status,
          post_date: Like(`%${date}%`),
        },
        order: {
          post_date: 'DESC',
        },
      });
    }
    return await this.find({
      where: {
        ID: Not(In(ids)),
        post_type: 'listing',
        post_parent: 0,
        post_status: status,
      },
      order: {
        post_date: 'DESC',
      },
    });
  }

  async getPostChilds(parent_id: number): Promise<Wp_posts[]> {
    return await this.find({
      where: {
        post_parent: parent_id,
        post_type: 'attachment',
      },
    });
  }
  async createPostChilds(posts: Wp_posts[]): Promise<Wp_posts[]> {
    return await this.save(posts);
  }

  async createPostParent(post: Wp_posts): Promise<Wp_posts> {
    let ID: number;
    await this.save(post).then((value) => {
      ID = value.ID;
    });
    return await this.updatePostParentGUIID(ID);
  }

  async updatePostParentGUIID(ID: number): Promise<Wp_posts> {
    const newPost = await this.findOne(ID);
    newPost.guid += newPost.ID;
    return await this.save(newPost);
  }
}
