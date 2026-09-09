---
pubDatetime: 2019-09-04T15:05:45Z
modDatetime: 2019-09-04T15:06:52Z
title: "Laravel and O365 Authentication"
tags:
  - "azure"
  - "Laravel"
  - "php"
  - "Web"
description: "Our app currently uses LDAP authentication but as our environment is rapidly moving onto the cloud and Microsoft Office 365 it's time to investigate authen"
---
Our app currently uses LDAP authentication but as our environment is rapidly moving onto the cloud and Microsoft Office 365 it's time to investigate authentication using O365, more specifically Azure Active Directory.

Getting this going was actually more straight forward than I expected. Laravel already has an authentication provider for OAuth2 called Socialite. Once installed I needed to add in the 'microsoft-graph' driver.

The key piece of the puzzle is here: [https://socialiteproviders.netlify.com/providers/microsoft-graph.html](https://socialiteproviders.netlify.com/providers/microsoft-graph.html)

[Socialite](https://github.com/laravel/socialite) provides the core, but is missing the link to Microsoft. By installing the above provider brings them together.

Once installed you need to make sure you get your [Azure Portal](https://portal.azure.com) configured to handle the the Microsoft part of the deal. I followed the [Register an Application with the Microsoft identity platform](https://docs.microsoft.com/en-us/graph/auth-register-app-v2) document to create my app. The only thing I needed to do at this stage was ensure I used the option for Multi-tenancy

> Accounts in any organizational directory (Any Azure AD directory - Multitenant)

This is because out of the box the provider is not set to pass details about a specific tenancy. So by following the guidance documents I got things working and my user was authenticating as expected.

Then I added the [Custom Tenant Id](https://socialiteproviders.netlify.com/providers/microsoft-graph.html#using-a-custom-tenant-id) and changed Azure to single-tenant to ensure only my organisation can logon. I followed the instructions here to get my tenant Id - [https://docs.microsoft.com/en-us/onedrive/find-your-office-365-tenant-id](https://docs.microsoft.com/en-us/onedrive/find-your-office-365-tenant-id).

I hit a few problems, that thanks to the excellent Github community I was able to resolve: [Github \#337](https://github.com/SocialiteProviders/Providers/issues/337)

#### .env

```
# O365 / MICROSOFT AZURE AD LOGIN
GRAPH_KEY=
GRAPH_SECRET=
GRAPH_TENANT_ID=
GRAPH_REDIRECT_URI=http://localhost:8000/home
```

#### LoginController.php

```
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;

use Socialite;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }

    /**
     * Redirect the user to the o365 authentication page.
     * 
     * References to env('GRAPH_TENANT_ID') can be changed to 
     * config('services.graph.tenant_id') which bypasses the Laravel
     * config cache.
     * 
     * See https://github.com/SocialiteProviders/Providers/issues/337
     *
     * @return \Illuminate\Http\Response
     */
    public function redirectToProvider()
    {
        return Socialite::with('graph')
            ->setTenantId(env('GRAPH_TENANT_ID'))
            ->redirect();
    }

    /**
     * Obtain the user information from o365.
     *
     * @return \Illuminate\Http\Response
     */
    public function handleProviderCallback()
    {
        $user = Socialite::driver('graph')
            ->setTenantId(env('GRAPH_TENANT_ID'))
            ->user();

        echo 'Looks like we got there as ' . $user->email;
        
    }
}
```
