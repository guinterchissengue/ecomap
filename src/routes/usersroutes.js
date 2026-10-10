import express from 'express';
import { getallusers, getuserbyid, createuser, updateuser, deleteuser } from '../controllers/userscontroller.js';
import { validateobjectid } from '../middleware/validateobjectid.js';

const router = express.Router();

router.route('/')
    .get(getallusers)
    .post(createuser);

router.route('/:id')
    .get(validateobjectid, getuserbyid)
    .put(validateobjectid, updateuser)
    .delete(validateobjectid, deleteuser);

export default router;