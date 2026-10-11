import express from 'express';
import { getallcleanups, getcleanupbyid, createcleanup, updatecleanup, deletecleanup } from '../controllers/cleanupscontroller.js';
import { validateobjectid } from '../middleware/validateobjectid.js';
import { validatebody, cleanuprules } from '../middleware/validate.js';
import { ensureauth } from '../middleware/auth.js';

const router = express.Router();

// reading is public, writing requires a logged in user
router.route('/')
    .get(getallcleanups)
    .post(ensureauth, validatebody(cleanuprules.create), createcleanup);

router.route('/:id')
    .get(validateobjectid, getcleanupbyid)
    .put(ensureauth, validateobjectid, validatebody(cleanuprules.update, { partial: true }), updatecleanup)
    .delete(ensureauth, validateobjectid, deletecleanup);

export default router;
