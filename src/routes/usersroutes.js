import express from 'express';
import { getallusers, getuserbyid, createuser, updateuser, deleteuser } from '../controllers/userscontroller.js';
import { validateobjectid } from '../middleware/validateobjectid.js';
import { validatebody, userrules } from '../middleware/validate.js';
import { ensureauth, ensureadmin } from '../middleware/auth.js';

const router = express.Router();

// reading is public, writing requires a logged in user
router.route('/')
    .get(getallusers)
    .post(ensureauth, ensureadmin, validatebody(userrules.create), createuser);

router.route('/:id')
    .get(validateobjectid, getuserbyid)
    .put(ensureauth, validateobjectid, validatebody(userrules.update, { partial: true }), updateuser)
    .delete(ensureauth, validateobjectid, deleteuser);

export default router;
