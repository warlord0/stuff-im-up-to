---
pubDatetime: 2025-06-02T09:12:50+00:00
title: "VSCodium Update Fails"
tags:
  - "Linux"
  - "Vscode"
  - "Vscodium"
heroImage: "/blog-media/2025/06/vscodium_logo.png"
description: "I switched from VSCode to VSCodium some time ago, but recently when updating VSCodium I was seeing it fail with an error message: vscodium lock file version `4` was found, but this version of Cargo does not understand this lock file, perhaps Cargo needs to be updated? Which is an obvious answer. But I've not…"
---
I switched from VSCode to VSCodium some time ago, but recently when updating VSCodium I was seeing it fail with an error message:

```
vscodium lock file version `4` was found, but this version of Cargo does not understand this lock file, perhaps Cargo needs to be updated?
```

Which is an obvious answer. But I’ve not used rust or cargo in any capacity. It turns out the update is easy, although not as simple as having `pamac` do it for you.

```
$ rustup check

stable-x86_64-unknown-linux-gnu - Update available : 1.77.0 (aedd173a2 2024-03-17) -> 1.87.0 (17067e9ac 2025-05-09)
rustup - Up to date : 1.28.2

$ rustup update stable
```

That’s it. Now I update VSCodium and it sails through.
