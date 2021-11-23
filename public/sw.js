
const CACHE_NAME = "cache-offline-v16";

self.addEventListener('install', e => {


  const promesa = caches.open(CACHE_NAME)
      .then( cache => {
          return cache.addAll([ 
              '/',
              '/offline-page.html',
              '/brand-logo.png',
              '/no-wifi-icon.png',
              '/background.jpg',
              '/favicon.ico'
              
          ]);
      })
      .catch(error => {
          console.log(error);
      });

    self.skipWaiting();

    e.waitUntil( promesa );

});


self.addEventListener('activate', event => {

    const promesa = caches.keys().then( keys => {
        keys.forEach( key => {
            if(key !== CACHE_NAME)
            {
                return caches.delete(key);
            }
        });
    });

    event.waitUntil( promesa );

});



self.addEventListener('fetch', event => {

    if(event.request.url.includes('no-wifi-icon.png')){
        const resp = caches.match(event.request)
            .catch( console.log('error al cargar no-wifi-icon.png') );
        event.respondWith( resp );

    }
    else if(event.request.url.includes('background.jpg')){
        const resp = caches.match(event.request)
            .catch( console.log('error al cargar background.jpg') );
        event.respondWith( resp );
    }
    else if(event.request.url.includes('brand-logo.png')){
        const resp = caches.match(event.request)
            .catch( console.log('error al cargar brand-logo.png') );
        event.respondWith( resp );
    }
    else if(event.request.url.includes('favicon.ico')){
        const resp = caches.match(event.request)
            .catch( console.log('error al cargar favicon.ico') );
        event.respondWith( resp );
    } 
    else {
        const resp = fetch(event.request)
        .catch( (error) =>  {

            if(event.request.headers.get('accept').includes('text/html')) {

                return caches.match('/offline-page.html');
            }

        } );

        event.respondWith( resp );
        
    }
})

 
  