import express from 'express';
import { getallreports, getreportbyid, createreport, updatereport, deletereport } from '../controllers/reportscontroller.js';
import { validateobjectid } from '../middleware/validateobjectid.js';

const router = express.Router();

router.route('/')
    .get(getallreports)
    .post(createreport);

router.route('/:id')
    .get(validateobjectid, getreportbyid)
    .put(validateobjectid, updatereport)
    .delete(validateobjectid, deletereport);

export default router;