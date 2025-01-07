const CACHE_NAME = 'expense-tracker-capture-v1';
const OFFLINE_URL = '/offline';

const urlsToCache = [
  '/',
  '/offline',
  '/capture',
  '/receipts',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Background sync for receipt uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'receipt-upload') {
    event.waitUntil(uploadPendingReceipts());
  }
});

// Handle offline receipt captures
const uploadPendingReceipts = async () => {
  try {
    const receiptsDb = await openDB('receipts-store', 1);
    const pendingReceipts = await receiptsDb
      .transaction('pending-receipts')
      .objectStore('pending-receipts')
      .getAll();

    for (const receipt of pendingReceipts) {
      try {
        const response = await fetch('/api/receipts/upload', {
          method: 'POST',
          body: receipt.formData,
        });

        if (response.ok) {
          await receiptsDb
            .transaction('pending-receipts', 'readwrite')
            .objectStore('pending-receipts')
            .delete(receipt.id);
        }
      } catch (error) {
        console.error('Failed to upload receipt:', error);
      }
    }
  } catch (error) {
    console.error('Failed to process pending receipts:', error);
  }
};

// Handle share target
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/share-target') && event.request.method === 'POST') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const receiptsDb = await openDB('receipts-store', 1);
          
          await receiptsDb
            .transaction('pending-receipts', 'readwrite')
            .objectStore('pending-receipts')
            .add({
              id: Date.now(),
              formData,
              timestamp: new Date(),
            });

          // Register for background sync
          await self.registration.sync.register('receipt-upload');

          // Redirect to the receipt list
          return Response.redirect('/receipts', 303);
        } catch (error) {
          console.error('Failed to handle share target:', error);
          return Response.redirect('/error', 303);
        }
      })()
    );
    return;
  }

  // Network-first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
      );
    })
  );
}); 