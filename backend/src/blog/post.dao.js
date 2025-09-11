const Post = require('../models/post.model');

const getAllPosts = () => {
  return Post.find({}).populate('subPage');
};

const getPostById = async (postId) => {
  return await Post.findById(postId).populate('subPage');
};

const createPost = (content, subPage, pinned) => {
  return Post.create({ content, subPage, pinned });
};

const editPost = async (postId, content, subPage, pinned) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('post not found');
  }
  post.content = content;

  if (subPage !== undefined) {
    post.subPage = subPage;
  }

    if (pinned !== undefined) {
    post.pinned = pinned;
  }
  
  return await post.save();
};

const deletePost = (postId) => {
  return Post.findByIdAndDelete(postId);
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  editPost,
  deletePost
};