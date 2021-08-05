const router = require('express').Router();
const { User } = require('../../models')

// /api/login

router.get('/login', (req, res) => {
    console.log('from api/login-------------->', req.session.loggedIn)
    try{
      if (req.session.loggedIn) {
        res.redirect('/');
        return;
      }
      res.render('login');
    } catch(err) {
      console.log(err);
      res.status(500).json(err);
    }
});

router.post('/login', async (req, res) => {
    try {
        const userData = await User.findOne({
            where: {
                username: req.body.username
            }
        })
        if(!userData) {
            res.status(500).json({message: "Invalid username or password. Please try again."});
            return;
        }

        const validPassword = await userData.checkPassword(req.body.password);

        if(!validPassword) {
            res.status(400).json({message: "Invalid username or password. Please try again."});
            return;
        }

        req.session.save(() => {
            req.session.loggedIn = true;
            req.session.user_id = userData.id
            res.status(200).json({
                user: userData, message: "You are now logged in!"
            })
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
})

router.post('/signup', async (req, res) => {
    try {
      const dbUserData = await User.create({
        username: req.body.username,
        password: req.body.password,
      });

      req.session.save(() => {
        req.session.loggedIn = true;
        req.session.user_id = dbUserData.id
        res.status(200).json(dbUserData);
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
});


router.post('/logout', (req, res) => {
    if(req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
})

module.exports = router;