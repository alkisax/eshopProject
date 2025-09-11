import Post from '../models/post.model';
import type { PostType, SubPageType } from '../types/blog.types';
import { DatabaseError, NotFoundError } from '../../stripe/types/errors.types';
import { Types } from 'mongoose';
import { slugify } from '../utils/slugify';

const getAllPosts = async (): Promise<PostType[]> => {
  try {
    const posts = await Post.find({})
      .populate<{ subPage: SubPageType }>('subPage')
      .exec();
    return posts;
  } catch (err) {
    throw new DatabaseError(`Failed to fetch posts: ${(err as Error).message}`);
  }
};

const getPostById = async (postId: string | Types.ObjectId): Promise<PostType> => {
  try {
    const post = await Post.findById(postId)
      .populate<{ subPage: SubPageType }>('subPage')
      .exec();

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    return post;
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw new DatabaseError(`Failed to fetch post: ${(err as Error).message}`);
  }
};

export const createPost = async (
  title: string,
  content: PostType['content'],
  subPage: Types.ObjectId | string | SubPageType,
  pinned: boolean
): Promise<PostType> => {
  try {
    const slug = slugify(title);
    return await Post.create({ title, slug, content, subPage, pinned });
  } catch (err) {
    throw new DatabaseError(`Failed to create post: ${(err as Error).message}`);
  }
};

const editPost = async (
  postId: string | Types.ObjectId,
  content: PostType['content'],
  subPage?: Types.ObjectId | string | SubPageType,
  pinned?: boolean,
  title?: string
): Promise<PostType> => {
  try {
    const post = await Post.findById(postId).exec();
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    post.content = content;
    if (subPage !== undefined) {
      post.subPage = subPage;
    }
    if (pinned !== undefined) {
      post.pinned = pinned;
    }

    if (title !== undefined) {
      post.title = title;
      post.slug = slugify(title);
    }

    return await post.save();
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw new DatabaseError(`Failed to edit post: ${(err as Error).message}`);
  }
};


const deletePost = async (postId: string | Types.ObjectId): Promise<PostType> => {
  try {
    const deleted = await Post.findByIdAndDelete(postId).exec();
    if (!deleted) {
      throw new NotFoundError('Post not found');
    }
    return deleted;
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw new DatabaseError(`Failed to delete post: ${(err as Error).message}`);
  }
};

export const postDAO = {
  getAllPosts,
  getPostById,
  createPost,
  editPost,
  deletePost
};
