/**
 * Parallax scroll effect for the homepage.
 * - Quote fades out and shifts up as user scrolls
 * - Posts reveal progressively with scroll progress
 */
(function () {
    'use strict';

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const easeInOutCubic = (t) => (t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

    const matchMediaSafe = (query) => {
        if (typeof window.matchMedia === 'function') {
            return window.matchMedia(query);
        }
        return {
            matches: false,
            addEventListener: null,
            removeEventListener: null,
            addListener: null,
            removeListener: null
        };
    };

    const addMediaListener = (queryList, callback) => {
        if (typeof queryList.addEventListener === 'function') {
            queryList.addEventListener('change', callback);
            return;
        }
        if (typeof queryList.addListener === 'function') {
            queryList.addListener(callback);
        }
    };

    const getViewportHeight = () => {
        const visualHeight = window.visualViewport ? window.visualViewport.height : 0;
        return Math.max(
            visualHeight || 0,
            window.innerHeight || 0,
            document.documentElement.clientHeight || 0,
            1
        );
    };

    const normalizeWheelDelta = (event) => {
        let delta = event.deltaY || 0;
        // deltaMode: 0=pixels, 1=lines, 2=pages
        if (event.deltaMode === 1) {
            delta *= 16;
        } else if (event.deltaMode === 2) {
            delta *= getViewportHeight();
        }
        return delta;
    };

    const init = () => {
        const stage = document.getElementById('parallax-stage');
        const hero = document.getElementById('parallax-hero');
        if (!stage || !hero) {
            return;
        }
        const header = document.querySelector('.header');

        const heroContent = hero.querySelector('.homepage-content');
        const postsSection = document.getElementById('posts-section');
        const postsTitle = postsSection ? postsSection.querySelector('.posts-title') : null;
        const postItems = postsSection ? Array.from(postsSection.querySelectorAll('.post-item')) : [];
        const indicator = hero.querySelector('.scroll-indicator');
        const reducedMotionQuery = matchMediaSafe('(prefers-reduced-motion: reduce)');
        const mobileQuery = matchMediaSafe('(max-width: 768px)');

        let heroHeight = Math.max(hero.offsetHeight || 0, getViewportHeight(), 1);
        let headerHeight = header ? Math.max(header.getBoundingClientRect().height, 0) : 0;
        let heroProgress = 0;
        let touchLastY = null;
        let ticking = false;

        const getHeroLift = () => (mobileQuery.matches ? 22 : 34);
        const getPostsOffset = () => (mobileQuery.matches ? 36 : 52);
        const getInputScale = () => (mobileQuery.matches ? 460 : 820);
        const getViewportCenterShift = () => headerHeight * 0.5;
        const isHomeLocked = () => (
            document.body.classList.contains('home-parallax-locked') ||
            document.documentElement.classList.contains('home-parallax-locked')
        );

        const updateMetrics = () => {
            const viewportHeight = getViewportHeight();
            headerHeight = header ? Math.max(header.getBoundingClientRect().height, 0) : 0;
            const stageHeight = Math.max(viewportHeight - headerHeight, viewportHeight * 0.55, 320);
            stage.style.setProperty('--stage-height', `${stageHeight.toFixed(2)}px`);
            heroHeight = Math.max(hero.offsetHeight || 0, viewportHeight, 1);
        };

        const setVisibleWithoutMotion = () => {
            const centerShift = getViewportCenterShift();
            if (heroContent) {
                heroContent.style.opacity = '1';
                heroContent.style.transform = `translate3d(0, -${centerShift.toFixed(2)}px, 0)`;
                heroContent.style.filter = 'none';
            }
            if (postsSection) {
                postsSection.style.opacity = '1';
                postsSection.style.transform = `translate3d(0, -${centerShift.toFixed(2)}px, 0)`;
                postsSection.style.filter = 'none';
            }
            if (postsTitle) {
                postsTitle.style.opacity = '1';
                postsTitle.style.transform = 'none';
            }
            postItems.forEach((item) => {
                item.style.opacity = '1';
                item.style.transform = 'none';
            });
            if (indicator) {
                indicator.style.opacity = '0';
            }
            stage.style.setProperty('--ambient-opacity', '0.08');
            stage.style.setProperty('--ambient-shift', '0%');
        };

        function updateParallax() {
            if (reducedMotionQuery.matches) {
                setVisibleWithoutMotion();
                ticking = false;
                return;
            }

            const progressHero = clamp(heroProgress, 0, 1);
            const postsProgress = clamp((progressHero - 0.25) / 0.65, 0, 1);
            const easedHero = easeOutCubic(progressHero);
            const easedPosts = easeInOutCubic(postsProgress);
            const easedDepth = easeOutQuint(progressHero);
            const centerShift = getViewportCenterShift();
            const heroBlurMax = mobileQuery.matches ? 1.3 : 3.1;
            const postsBlurMax = mobileQuery.matches ? 1.1 : 2.4;

            if (postsSection) {
                const sectionOffset = getPostsOffset() * (1 - easedPosts);
                postsSection.style.opacity = (0.08 + easedPosts * 0.92).toFixed(3);
                postsSection.style.transform = `translate3d(0, ${(sectionOffset - centerShift).toFixed(2)}px, 0) scale(${(0.985 + easedPosts * 0.015).toFixed(4)})`;
                postsSection.style.filter = `blur(${((1 - easedPosts) * postsBlurMax).toFixed(2)}px)`;
            }

            if (heroContent) {
                const heroLift = getHeroLift() * easedHero;
                heroContent.style.opacity = (1 - easedHero).toFixed(3);
                heroContent.style.transform = `translate3d(0, -${(heroLift + centerShift).toFixed(2)}px, 0) scale(${(1 - easedHero * 0.06).toFixed(4)})`;
                heroContent.style.filter = `blur(${(easedHero * heroBlurMax).toFixed(2)}px)`;
            }

            if (postsTitle) {
                const titleProgress = easeInOutCubic(clamp((postsProgress - 0.04) / 0.96, 0, 1));
                const titleDrift = mobileQuery.matches ? 8 : 14;
                postsTitle.style.opacity = titleProgress.toFixed(3);
                postsTitle.style.transform = `translate3d(0, ${(titleDrift * (1 - titleProgress)).toFixed(2)}px, 0)`;
            }

            if (postItems.length > 0) {
                const staggerStep = 0.08;
                const revealWindow = 0.55;
                postItems.forEach((item, index) => {
                    const start = index * staggerStep;
                    const itemProgress = clamp((postsProgress - start) / revealWindow, 0, 1);
                    const easedItem = easeInOutCubic(itemProgress);
                    const driftYBase = mobileQuery.matches ? 10 : 18;
                    const driftXBase = mobileQuery.matches ? 4 : 10;
                    const driftY = (1 - easedItem) * driftYBase;
                    const driftX = (index % 2 === 0 ? -1 : 1) * (1 - easedItem) * driftXBase;
                    item.style.opacity = easedItem.toFixed(3);
                    item.style.transform = `translate3d(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px, 0)`;
                });
            }

            if (indicator) {
                indicator.style.opacity = Math.max(0, 1 - progressHero * 4).toFixed(3);
                indicator.style.transform = `translate3d(-50%, ${(progressHero * 10).toFixed(2)}px, 0)`;
            }
            stage.style.setProperty('--ambient-opacity', (0.04 + easedDepth * 0.1).toFixed(3));
            stage.style.setProperty('--ambient-shift', `${(easedDepth * 12).toFixed(2)}%`);

            ticking = false;
        }

        const requestTick = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        const updateProgress = (delta) => {
            if (!delta || reducedMotionQuery.matches) {
                return;
            }
            heroProgress = clamp(heroProgress + (delta / getInputScale()), 0, 1);
            requestTick();
        };

        const setProgressFromScroll = () => {
            if (isHomeLocked()) {
                return;
            }
            const maxScroll = Math.max(heroHeight * 0.95, 1);
            heroProgress = clamp(window.scrollY / maxScroll, 0, 1);
            requestTick();
        };

        const handleWheel = (event) => {
            if (isHomeLocked() && event.cancelable) {
                event.preventDefault();
            }
            updateProgress(normalizeWheelDelta(event));
        };

        const handleTouchStart = (event) => {
            if (event.touches.length !== 1) {
                return;
            }
            touchLastY = event.touches[0].clientY;
        };

        const handleTouchMove = (event) => {
            if (event.touches.length !== 1 || touchLastY === null) {
                return;
            }
            const currentY = event.touches[0].clientY;
            const delta = touchLastY - currentY;
            touchLastY = currentY;
            if (isHomeLocked() && event.cancelable) {
                event.preventDefault();
            }
            updateProgress(delta);
        };

        const handleTouchEnd = () => {
            touchLastY = null;
        };

        const handleKeydown = (event) => {
            const target = event.target;
            const tagName = target && target.tagName ? target.tagName.toLowerCase() : '';
            const isEditable = target && target.isContentEditable;
            if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || isEditable) {
                return;
            }

            const steps = {
                ArrowDown: 70,
                PageDown: 170,
                ' ': 120,
                ArrowUp: -70,
                PageUp: -170,
                Home: -9999,
                End: 9999
            };

            if (!(event.key in steps)) {
                return;
            }

            if (event.cancelable) {
                event.preventDefault();
            }

            updateProgress(steps[event.key]);
        };

        document.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });
        window.addEventListener('keydown', handleKeydown, { passive: false });
        window.addEventListener('scroll', setProgressFromScroll, { passive: true });
        window.addEventListener('resize', () => {
            updateMetrics();
            requestTick();
        }, { passive: true });
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                updateMetrics();
                requestTick();
            }, { passive: true });
        }

        addMediaListener(reducedMotionQuery, requestTick);
        addMediaListener(mobileQuery, () => {
            updateMetrics();
            requestTick();
        });

        document.documentElement.classList.add('home-parallax-locked');
        document.body.classList.add('home-parallax-locked');
        document.body.classList.add('js-parallax-ready');
        updateMetrics();
        window.scrollTo(0, 0);
        updateParallax();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
