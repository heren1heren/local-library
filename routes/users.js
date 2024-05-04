import { Router } from 'express';
const router = Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
router.get('/cool', function (req, res, next) {
  res.send('you are so cool');
});

export default router;
