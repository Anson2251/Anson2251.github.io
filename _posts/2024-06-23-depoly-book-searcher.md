---
layout: post
title: "Deploying 'Book Searcher' on Your Laptop Using Z-Library Data"
date: 2024-06-23 21:00:00 +0800
categories: library
---

{% include override-styles.html %}

## Introduction

Are you tired of finding the electronic version of your favorite books? In this guide, I'll walk you through how to deploy the Book Searcher project on your laptop, using data from Z-Library. By the end of this post, you'll have a personal library search tool at your fingertips.

## Background

[<u>Book Searcher</u>](https://github.com/bigmouse0001/book-searcher) is a convenient tool to set up a personal library.

> Easy and blazing-fast book searcher, create and search your private library. Book Searcher can index metadata for over 10 million books in one minute, and search in 30µs. (Cited from the README of the Book Searcher)

With data from Z-Library, you can access countless electronic books freely.

> <span style="color:red">⚠️</span> **Books are the works of their authors. It is recommended to buy the book, instead of using the version obtained from the internet "freely".**

Unfortunately, the demonstration site for [Book Searcher](https://book-searcher.eu.org/) has recently become inaccessible. To address this, we'll explore how to deploy the Book Searcher locally on a laptop.

## How to Deploy

### 1. Get the Book Searcher

First, find and download the Book Searcher software.

1. Visit the [release page](https://github.com/bigmouse0001/book-searcher/releases) on GitHub.
2. Download the release suitable for your platform and CPU architecture.
3. Unzip the downloaded file to extract the executable.

### 2. Obtain the Z-Library Data

Book Searcher uses indexes for efficient book searching. You can download the indexes from [this mirror](https://onedrive.caomingjun.com/zh-CN/%F0%9F%96%A5%E8%BD%AF%E4%BB%B6/zlib-searcher/releases/) (Thanks to Cmj), preferably version 1.2.0.

For more information about this step, you can  visit [this post](https://www.eula.club/blogs/%E6%90%AD%E5%BB%BABook-Searcher%E5%AE%9E%E7%8E%B0%E4%B9%A6%E7%B1%8D%E6%A3%80%E7%B4%A2.html#_3-book-searcher%E4%B9%A6%E7%B1%8D%E6%A3%80%E7%B4%A2).

### 3. Configure the Book Searcher

Now, prepare the files:

```
.
├── book-searcher
└── index
    ├── 37c0704c609e49648af4eefe19aafa35.fast
    ├── 37c0704c609e49648af4eefe19aafa35.fieldnorm
    ├── 37c0704c609e49648af4eefe19aafa35.idx
    ├── 37c0704c609e49648af4eefe19aafa35.pos
    ├── 37c0704c609e49648af4eefe19aafa35.store
    ├── 37c0704c609e49648af4eefe19aafa35.term
    └── meta.json
```


Unzip the index file to match the structure above. Then, open the terminal and start the service:

```sh
./book-searcher run
```

The terminal will display the address where you can access Book Searcher via your browser.

### 4. IPFS Gateways

To download books, you'll need IPFS gateways. Here are some recommended gateways:

```
https://4everland.io/ipfs/
https://ipfs.io/ipfs/
https://hardbin.com/ipfs/
https://trustless-gateway.link/ipfs/
https://dweb.link/ipfs/
https://ipfs.runfission.com/ipfs/
https://w3s.link/ipfs/
https://gateway.pinata.cloud/ipfs/
https://ipfs.eth.aragon.network/ipfs/
https://nftstorage.link/ipfs/
```

For more information, use the [Public Gateway Checker](https://ipfs.github.io/public-gateway-checker/).

By adding the setting of the Book Searcher, we finally managed to configure the book searcher.

## References

This blog uses the resources/information from the following web pages:

- [Book Searcher Github Repository](https://github.com/bigmouse0001/book-searcher/releases)
- [Public Gateway Checker](https://ipfs.github.io/public-gateway-checker/)
- [The index mirror on Cmj's OneDrive](https://onedrive.caomingjun.com/zh-CN/%F0%9F%96%A5%E8%BD%AF%E4%BB%B6/zlib-searcher/)
- [搭建 Book-Searcher 实现书籍检索](https://www.eula.club/blogs/%E6%90%AD%E5%BB%BABook-Searcher%E5%AE%9E%E7%8E%B0%E4%B9%A6%E7%B1%8D%E6%A3%80%E7%B4%A2.html) [(Archived)](https://web.archive.org/web/20240930211053/https://www.eula.club/blogs/%E6%90%AD%E5%BB%BABook-Searcher%E5%AE%9E%E7%8E%B0%E4%B9%A6%E7%B1%8D%E6%A3%80%E7%B4%A2.html#_1-%E5%89%8D%E8%A8%80)


This version should be clearer and more organized, making it easier for readers to follow and replicate the steps.
