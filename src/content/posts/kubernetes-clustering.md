---
pubDatetime: 2023-07-05T21:07:31Z
title: "Kubernetes Clustering"
tags:
  - "Docker"
  - "kubernetes"
  - "Linux"
  - "Virtualisation"
heroImage: "/blog-media/2023/07/kubernetes.png"
description: "This week I have been dabbling in the dark arts that are Kubernetes. I read the Kubernetes getting started guide for learning it with minikube, and thought"
---
This week I have been dabbling in the dark arts that are Kubernetes.

I read the Kubernetes getting started guide for learning it with minikube, and thought that it's not really useful for what I want to use it for. I'm already familiar with Docker Swarm, and figure Kubernetes would pretty much be Docker Swarm Plus - how hard can it be?

Nothing I read lead me to getting a successful cluster. Everything seemed to expect you to have an understanding of Kubernetes to a degree. Kind of "... now you have it installed, you can deploy containers." I kept thinking, hang on, I'm missing something here. My cluster isn't starting. My nodes show "NotReady" the error messages I see don't make any sense, and when I search for them, I get the same experience where the answer expects that you know more about Kubernetes than I do!

I know what I want to achieve, I know Kubernetes will give me the architecture to do it, but I don't understand the instructions for getting my cluster working. But I'm getting more confused about the guidance to install one component, that then references another series of pages of prerequisites, and suggestions, that by the time I come back to what led me away from what I was installing, made me question where I was, and what I was doing.

Days after my journey began, after signing up for courses, watching videos, reading ebooks, I found this:

[How to Start a Kubernetes Cluster From Scratch With Kubeadm and Kubectl](https://www.howtogeek.com/devops/how-to-start-a-kubernetes-cluster-from-scratch-with-kubeadm-and-kubectl/)

The part I was missing:

> Kubernetes requires a Pod networking addon to exist in your cluster before worker nodes begin operating normally. You must manually install a [compatible addon](https://kubernetes.io/docs/concepts/cluster-administration/addons/#networking-and-network-policy) to complete your installation.

Now, I did read that in a lot of places I went, but could not decipher the part that it's completely up to me to choose a CNI (Container Network Interface) to use with Kubernetes. There are a lot to choose from, and at this early stage all I want is someone to tell me what to pick, and that later on, when I understand things more, I can change my mind based on the knowledge I gain.

Following the [How to Start a Kubernetes Cluster From Scratch With Kubeadm and Kubectl](https://www.howtogeek.com/devops/how-to-start-a-kubernetes-cluster-from-scratch-with-kubeadm-and-kubectl/) I ended up with a running cluster, and I can begin to learn how to use Kubernetes from the point where I have a running cluster to start with!

I can already see that this isn't the end of my educational frustrations. Maybe I'm just being a bit thick, but doing things I imagined straight forward, seem clouded by documentation cross-referencing webs that are easy to get lost in.
