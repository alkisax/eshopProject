import { postDAO } from '../daos/post.dao';
import type { Request, Response } from 'express';
import type { PostType } from '../types/blog.types';
import { handleControllerError } from '../../utils/error/errorHandler';
import { createPostSchema, editPostSchema } from '../validation/blog.schema';

const createPost = async (req: Request, res: Response) => {
  try {
    const parsed = createPostSchema.parse(req.body);
    const { title, content, subPage, pinned } = parsed;

    if (!title || !title.trim()) {
      return res.status(400).json({ status: false, message: 'Post title required' });
    }
    if (!content || !content.blocks || content.blocks.length === 0) {
      return res.status(400).json({ status: false, message: 'Invalid EditorJS content' });
    }

    const savedPost = await postDAO.createPost(
      title,
      content as PostType['content'],
      subPage!,
      pinned ?? false
    );
    return res.status(201).json({ status: true, data: savedPost });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const editPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const parsed = editPostSchema.parse(req.body);
    const { title, content, subPage, pinned } = parsed;

    if (!content || !content.blocks || content.blocks.length === 0) {
      return res.status(400).json({ status: false, message: 'Invalid EditorJS content for edit' });
    }

    const updatedPost = await postDAO.editPost(
      postId,
      content as PostType['content'],
      subPage,
      pinned,
      title
    );
    return res.status(200).json({ status: true, data: updatedPost });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// === GET ALL ===
const getAllPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await postDAO.getAllPosts();
    return res.status(200).json({ status: true, data: posts });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// === GET ONE ===
const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = await postDAO.getPostById(postId);
    return res.status(200).json({ status: true, data: post });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await postDAO.getPostBySlug(slug);
    return res.status(200).json({ status: true, data: post });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// === DELETE ===
const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const deleted = await postDAO.deletePost(postId);
    return res.status(200).json({ status: true, message: 'Post deleted successfully', data: deleted });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const postController = {
  createPost,
  editPost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  deletePost,
};
