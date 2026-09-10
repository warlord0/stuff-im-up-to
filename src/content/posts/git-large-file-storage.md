---
pubDatetime: 2023-10-06T08:43:06Z
title: "Git Large File Storage"
tags:
  - "git"
  - "Uncategorized"
heroImage: "/blog-media/2016/12/octocat.png"
description: "We have a client that needs their legacy system and data giving to them in a useable format. We can't really give them the code to build the system, as the"
---
We have a client that needs their legacy system and data giving to them in a useable format. We can't really give them the code to build the system, as they don't really have the skills or requirement for that. What they do want is the config and the Docker image, so they could spin it up some time and access the old data.

The Docker image weighs in at 1.24 GB (GZipped to 434 MB).

Github has a limit on 100MB for file sizes unless you use LFS. LFS is a git extension that you use to identify large files, and it will upload them to a large file storage backend system. As far as you can tell, looking at the repository, you see no difference. The file is just held on some other storage platform.

First thing to do is install the extension. Get it from your Linux package repository.

```
pamac install git-lfs
```

Then you need to initialise it using:

```
git lfs install
```

If you already have a large file in your git, you will need to remove it and readd it after you set the repository to track large files.

Set your project to track large files by extension, eg.

```
git lfs track "*.gz"
```

Then add your large file(s) to your project.

Now when you commit and push you should see that the files) get uploaded using LFS and you don't hit the 100 MB file limit.

```
$ git commit -m "Docker image"
[main f32bdda] Docker image
 1 file changed, 3 insertions(+)
 create mode 100644 docker_6457b92fee3f.gz

$ git push
Uploading LFS objects: 100% (1/1), 434 MB | 14 MB/s, done.                                                                                                                    
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 411 bytes | 411.00 KiB/s, done.
Total 3 (delta 1), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
To github.com:myorg/myrepo.git
   268edc1..f32bdda  main -> main
```
