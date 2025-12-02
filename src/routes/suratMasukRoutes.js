
import express from 'express';
import { AuthMiddleware } from '../middlewares/auth.js';
import { SuratMasukController } from '../controllers/suratMasukController.js';

const router = express.Router();
const controller = new SuratMasukController();

// Semua route surat masuk memerlukan autentikasi
router.use(AuthMiddleware.authenticate);

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;


