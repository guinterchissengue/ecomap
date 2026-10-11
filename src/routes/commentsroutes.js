import express from 'express';
import { getallcomments, getcommentbyid, createcomment, updatecomment, deletecomment } from '../controllers/commentscontroller.js';
import { validateobjectid } from '../middleware/validateobjectid.js';
import { validatebody, commentrules } from '../middleware/validate.js';
import { ensureauth } from '../middleware/auth.js';

const router = express.Router();

// reading is public, writing requires a logged in user
router.route('/')
    .get(getallcomments)
    .post(ensureauth, validatebody(commentrules.create), createcomment);

router.route('/:id')
    .get(validateobjectid, getcommentbyid)
    .put(ensureauth, validateobjectid, validatebody(commentrules.update, { partial: true }), updatecomment)
    .delete(ensureauth, validateobjectid, deletecomment);

export default router;
