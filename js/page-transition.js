/**
 * Page transition for internal navigation links.
 * Applies a short exit animation before moving to the next page.
 */
(function () {
    'use strict';

    const canAnimate = typeof window !== 'undefined' && typeof document !== 'undefined';
    if (!canAnimate) {
        return;
    }

    const reducedMotionQuery = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : { matches: false };

    if (reducedMotionQuery.matches) {
        return;
    }

    const body = document.body;
    if (!body) {
        return;
    }

    const TRANSITION_MS = 320;
    const INTERACTIVE_SELECTOR = '#menu a, .logo a, .lang-switch a';
    let isLeaving = false;

    body.classList.add('page-transition-ready');

    const isModifiedClick = (event) => (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
    );

    const isSamePageHashLink = (url) => (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        !!url.hash
    );

    const shouldHandle = (anchor, event) => {
        if (!anchor || !anchor.href || event.defaultPrevented || isModifiedClick(event)) {
            return false;
        }

        if (anchor.target && anchor.target !== '_self') {
            return false;
        }

        if (anchor.hasAttribute('download')) {
            return false;
        }

        const targetUrl = new URL(anchor.href, window.location.href);
        if (targetUrl.origin !== window.location.origin) {
            return false;
        }

        if (isSamePageHashLink(targetUrl)) {
            return false;
        }

        const currentPath = window.location.pathname + window.location.search;
        const targetPath = targetUrl.pathname + targetUrl.search;
        if (targetPath === currentPath && !targetUrl.hash) {
            return false;
        }

        return true;
    };

    const navigateWithTransition = (href) => {
        if (isLeaving) {
            return;
        }

        isLeaving = true;
        body.classList.add('page-leaving');

        window.setTimeout(function () {
            window.location.assign(href);
        }, TRANSITION_MS);
    };

    document.addEventListener('click', function (event) {
        const anchor = event.target.closest(INTERACTIVE_SELECTOR);
        if (!anchor || !shouldHandle(anchor, event)) {
            return;
        }

        event.preventDefault();
        navigateWithTransition(anchor.href);
    }, true);

    window.addEventListener('pageshow', function () {
        isLeaving = false;
        body.classList.remove('page-leaving');
    });
})();
