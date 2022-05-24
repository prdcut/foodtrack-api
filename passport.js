// Authentication strategy

const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let User = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      emailField: 'email',
      passwordField: 'password',
    },
    (email, password, callback) => {
      console.log(`${email} ${password}`);
      User.findOne({ email: email }, (error, user) => {
        if (error) {
          console.log(error);
          return callback(error);
        }

        if (!user) {
          console.log('incorrect email');
          return callback(null, false, {
            message: 'Incorrect emial or password.',
          });
        }

        if (!user.validatePassword(password)) {
          console.log('incorrect password');
          return callback(null, false, { message: 'Incorrect password.' });
        }

        console.log('finished');
        return callback(null, user);
      });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'uncorruptedSecret',
    },
    (jwtPayload, callback) => {
      return User.findById(jwtPayload._id)
        .then(user => {
          return callback(null, user);
        })
        .catch(error => {
          return callback(error);
        });
    }
  )
);
