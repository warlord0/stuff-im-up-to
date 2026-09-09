---
pubDatetime: 2018-03-28T12:42:07Z
modDatetime: 2018-03-28T17:40:08Z
title: "Vue.js, Laravel and JSON Web Tokens"
tags:
  - "JavaScript"
  - "Laravel"
  - "vue.js"
  - "Web"
description: "When you have a Vue.js powered app authentication using traditional logon pages isn't going to work."
---
When you have a Vue.js powered app authentication using traditional logon pages isn't going to work. This is because primarily the apps interaction with the server is using Ajax calls with axios. So now we need to use JSON Web Tokens (JWT) to handle the authentication and store a client side session authentication token. This article is very useful for this: [https://codeburst.io/api-authentication-in-laravel-vue-spa-using-jwt-auth-d8251b3632e0](https://codeburst.io/api-authentication-in-laravel-vue-spa-using-jwt-auth-d8251b3632e0) It didn't cover all of the aspects in my case as I'm using Laravel 5.5. So some of the changes I needed to make were in regard to that. In particular I had to switch to using the development branch of the `jwt-auth` project as linked in the article taking you here: [https://github.com/tymondesigns/jwt-auth/issues/1298](https://github.com/tymondesigns/jwt-auth/issues/1298) In the header of the AuthController needed to include:

    use Auth;
    use App\User;
    use JWTAuth;

I then had to amend the User model to include the trait JWTSubject

    use Tymon\JWTAuth\Contracts\JWTSubject;
    use Illuminate\Notifications\Notifiable;
    use Illuminate\Foundation\Auth\User as Authenticatable;

    class User extends Authenticatable implements JWTSubject

and add to it the two functions/methods as detailed here [http://jwt-auth.readthedocs.io/en/docs/quick-start/#update-your-user-model](http://jwt-auth.readthedocs.io/en/docs/quick-start/#update-your-user-model)

        /**
         * Get the identifier that will be stored in the subject claim of the JWT.
         *
         * @return mixed
         */
        public function getJWTIdentifier()
        {
            return $this->getKey();
        }

        /**
         * Return a key value array, containing any custom claims to be added to the JWT.
         *
         * @return array
         */
        public function getJWTCustomClaims()
        {
            return [];
        }

Now all I have to do is figure out how to authenticate by user name not email address. Then switch from the database authentication to LDAP.

### References

[https://github.com/tymondesigns/jwt-auth](https://github.com/tymondesigns/jwt-auth)
