---
pubDatetime: 2018-07-31T20:21:18Z
modDatetime: 2018-08-02T18:33:20Z
title: "Yarn, npm and Git"
tags:
  - "git"
  - "JavaScript"
  - "npm"
  - "Web"
  - "yarn"
description: "I'm kinda new to this hosting software externally. I've been happy using Gitlab for internal private projects, but recently I've been forking and reworking"
---
I'm kinda new to this hosting software externally. I've been happy using [Gitlab](https://about.gitlab.com/) for internal private projects, but recently I've been forking and reworking the work of others to include into my own. So I thought I'd try publishing them back out to [npmjs.com](https://www.npmjs.com) and [github,com](https://www.github.com). Publishing up to github is pretty straight forward. Using git from the command line to just add, commit and push is all the same, just now with an online repository rather than the internal Gitlab. In fact once the repository is added to the project I'm betting the [Atom.io](https://atom.io/) built in Git will handle the committing and pushing. Recently I decided to have a look at [yarn](https://yarnpkg.com/en/) - it uses the npmjs repository just like npm. So far I'm liking it. It's kinda pretty and I do like the caching. I pretty much use `yarn` where ever I would have used `npm`. So instead of `npm init` I use `yarn init`, `npm install` I now use `yarn add`. Where I used `npm run dev` now it's `yarn run dev`, and `yarn run hot`, etc.

## Publishing

Now to push my packages up to npmjs. First you have to have an npmjs account, so sign up. Like Github, npmjs is only free for "public" packages. If you want "private", you have to pay. Then link yarn and npm up to your npmjs account using login.

    $ yarn login
    yarn login v1.7.0
    question npm username: mynpmjsname
    question npm email: me@mail.com 
    Done in 32.16s.

Similarly for npm. This saves an auth token into your `.npmrc` file so if you've supplied the password already you won't need it to publish with. What I found after pushing up to git and publishing to npmjs was that I was doing things in the wrong order. So used to doing git commit and push, it's second nature. Before you git push to github, publish the package to npmjs. Do it this way because it will force a version increment which will do a git commit. Because it will have incremented the version in your `package.json`. The name, version and description etc. in your `package.json` is what will be used by your project. Because you are likely to want to publish what is probably a private project name (beginning with @) to a public project you'll need to tell your publish command to make it public, or you'll get a warning pretty much about about not having subscribed to publish private projects.

    $ yarn publish --access=public

When you look at your projects in your npmjs.com profile you'll see your fresh project ready for everyone to consume!

    $ yarn publish
    yarn publish v1.7.0
    [1/4] Bumping version... 
    info Current version: 1.8.1 
    question New version: 1.8.2 
    info New version: 1.8.2 
    [2/4] Logging in... 
    [3/4] Publishing... 
    success Published. 
    [4/4] Revoking token... 
    info Not revoking login token, specified via config file. 
    Done in 8.85s.

But that's how easy it was to publish up to npmjs! Now you've pushed to npmjs, you can do a `git push` to deliver the same project up to Github.com now with the new version.

### References

[https://yarnpkg.com/en/docs/creating-a-package](https://yarnpkg.com/en/docs/creating-a-package)
