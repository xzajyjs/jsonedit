if (location.protocol === 'chrome-extension:') {
    document.body.classList.add('extension-popup');
}

// Register the PWA service worker only when the app is served over http(s).
if ('serviceWorker' in navigator && ['http:', 'https:'].includes(location.protocol)) {
    navigator.serviceWorker.register('./sw.js').then(function () {
        console.log('Service Worker 注册成功');
    }).catch(function (err) {
        console.warn('Service Worker 注册失败', err);
    });
}
