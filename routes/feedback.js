const express = require('express');

const { check, validationResult } = require('express-validator');

const router = express.Router();

const validations = [
  check('name').trim().isLength({ min: 3 }).escape().withMessage('A valid name is required'),
  check('email').trim().isEmail().normalizeEmail().withMessage('A valid email address is required'),
  check('title').trim().isLength({ min: 3 }).escape().withMessage('A valid title is required'),
  check('message').trim().isLength({ min: 3 }).escape().withMessage('A valid message is required'),
];

module.exports = (params) => {
  const { feedbackService } = params;

  router.get('/', async (request, res, err) => {
    try {
      const errors = request.session.feedback ? request.session.feedback.errors : false;

      const successMessage = request.session.feedback ? request.session.feedback.message : false;

      request.session.feedback = {};
      const feedback = await feedbackService.getList();
      return res.render('layout', {
        pageTitle: 'Feedback',
        template: 'feedback',
        feedback,
        errors,
        successMessage,
      });
    } catch {
      return next(err);
    }
  });

  router.post('/', validations, async (request, res, next) => {
    try {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.session.feedback = {
          errors: errors.array(),
        };
        return res.redirect('/feedback');
      }

      const { name, email, title, message } = request.body;

      await feedbackService.addEntry(name, email, title, message);

      request.session.feedback = {
        message: 'Thank you for your feedback!',
      };

      return res.redirect('/feedback');
    } catch (err) {
      return next(err);
    }
  });

  router.post('/api', validations, async (request, res, next) => {
    try {
      const errors = validationResult(request);

      if (!errors.isEmpty) {
        return res.json({ errors: errors.array() });
      }

      console.log('I am being called');
      console.log(request.body);

      const { name, email, title, message } = request.body;
      await feedbackService.addEntry(name, email, title, message);
      const feedback = await feedbackService.getList();

      return res.json({ feedback, successMessage: 'Thanks for the feedback' });
    } catch (errors) {
      return next(errors);
    }
  });

  return router;
};
