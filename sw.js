const CACHE_NAME = "taskmind-ai-v1";

const FILES = [
    "./",
    "./index.html",
    "./manifest.json"
];

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(FILES))
    );

    self.skipWaiting();
});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys =>

            Promise.all(

                keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))

            )

        )

    );

    self.clients.claim();
});


self.addEventListener("fetch", event => {

    if(event.request.method !== "GET"){
        return;
    }

    event.respondWith(

        caches.match(event.request)
        .then(cached => {

            if(cached){
                return cached;
            }

            return fetch(event.request)
                .then(response => {

                    if(
                        !response ||
                        response.status !== 200 ||
                        response.type === "opaque"
                    ){
                        return response;
                    }

                    const copy = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache =>
                            cache.put(
                                event.request,
                                copy
                            )
                        );

                    return response;

                })
                .catch(() =>
                    caches.match("./index.html")
                );

        })

    );

});


/* Notification click */

self.addEventListener("notificationclick", event => {

    event.notification.close();

    event.waitUntil(

        clients.matchAll({
            type:"window",
            includeUncontrolled:true
        }).then(clientList => {

            for(const client of clientList){

                if("focus" in client){
                    return client.focus();
                }

            }

            if(clients.openWindow){
                return clients.openWindow("./");
            }

        })

    );

});