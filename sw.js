"use strict";

const cacheName = 'version1';
const appShellFiles = [
  "./icons/icon-512.png",
  "./icons/icon-256.png",
  "./icons/icon-192.png",
  "./icons/maskable_icon.png",
  "./app.js",
  "./index.html",
  "./manifest.json",
  "./style.css",
  "./sw.js"
];


self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(appShellFiles);
  })());
});

self.addEventListener('fetch', (e) => {
	console.log("fetch"+e.request.url);
  e.respondWith((async () => {
  	let ressource = e.request.url;
  	if(appShellFiles.includes(ressource)){
  		console.log("priorizeCache");
  		return priorizeCache(e);
  	}else{
  		console.log("priorizeWeb");
  		return priorizeWeb(e);
  	}
    
  })());
});

async function priorizeCache(e){
	const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) { return r; }
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
}

async function priorizeWeb(e){
	
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    if(response.ok){
    	return response;
    }

    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) { 
    	return r;
    }
    return response;

}

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key === cacheName) { return; }
      return caches.delete(key);
    }))
  }));
});
