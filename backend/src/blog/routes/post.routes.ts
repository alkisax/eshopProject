import express from 'express';
const router = express.Router();
import { postController } from '../controllers/post.controller';


router.post('/', postController.createPost);

router.get('/', postController.getAllPosts);

router.get('/:postId', postController.getPostById);

router.put('/:postId', postController.editPost);

router.delete('/:postId', postController.deletePost);

export default router;