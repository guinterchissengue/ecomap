import express from 'express';
import { getallreports, getreportbyid, createreport, updatereport, deletereport } from '../controllers/reportscontroller.js';
import { validateobjectid } from '../middleware/validateobjectid.js';
import { validatebody, reportrules } from '../middleware/validate.js';
import { ensureauth } from '../middleware/auth.js';

const router = express.Router();

// reading is public, writing requires a logged in user
router.route('/')
    .get(getallreports)
    .post(ensureauth, validatebody(reportrules.create), createreport);

router.route('/:id')
    .get(validateobjectid, getreportbyid)
    .put(ensureauth, validateobjectid, validatebody(reportrules.update, { partial: true }), updatereport)
    .delete(ensureauth, validateobjectid, deletereport);

export default router;
