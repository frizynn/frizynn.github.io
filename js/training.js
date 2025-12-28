(function () {
    const splash = document.getElementById('neural-splash');
    const content = document.getElementById('site-content');
    const trigger = document.getElementById('neural-trigger');
    const canvasContainer = document.getElementById('neural-canvas-container');

    // Persist training state
    if (sessionStorage.getItem('neural-sync') === 'complete') {
        splash.style.display = 'none';
        content.style.display = 'block';
        content.style.opacity = '1';
        document.body.classList.add('synced');
        return;
    }

    let scene, camera, renderer, particles, grid;
    const particleCount = 2000;

    function initThree() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        canvasContainer.appendChild(renderer.domElement);

        camera.position.set(30, 20, 30);
        camera.lookAt(0, 0, 0);

        // Core Blueprint: Infinite Grid
        grid = new THREE.GridHelper(200, 40, 0x11ff11, 0x052205);
        grid.position.y = -5;
        grid.material.transparent = true;
        grid.material.opacity = 0.2;
        scene.add(grid);

        // Neural Particles (Loss Surface Points)
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = Math.random() * 50;
            positions[i + 2] = (Math.random() - 0.5) * 100;
            velocities[i + 1] = -Math.random() * 0.1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ color: 0x00ff00, size: 0.2, transparent: true, opacity: 0.6 });
        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        render();
    }

    function render() {
        if (!renderer) return;
        requestAnimationFrame(render);
        renderer.render(scene, camera);

        // Passive noise
        const pos = particles.geometry.attributes.position.array;
        for (let i = 1; i < pos.length; i += 3) {
            pos[i] += Math.sin(Date.now() * 0.001 + pos[i - 1]) * 0.02;
        }
        particles.geometry.attributes.position.needsUpdate = true;

        scene.rotation.y += 0.0005;
    }

    function startSync() {
        trigger.classList.add('triggering');
        trigger.innerHTML = "SYNCING_NEURAL_WEIGHTS...";

        let progress = 0;
        const duration = 2400; // ms
        const start = Date.now();

        function syncAnim() {
            const now = Date.now();
            const elapsed = now - start;
            progress = Math.min(1, elapsed / duration);

            // Convergence visualization
            const pos = particles.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) {
                // Particles gravitate toward a "loss curve" cone
                const x = pos[i];
                const z = pos[i + 2];
                const targetY = (Math.sqrt(x * x + z * z) * 0.2 * (1 - progress)) - 5;
                pos[i + 1] += (targetY - pos[i + 1]) * 0.05;
            }
            particles.geometry.attributes.position.needsUpdate = true;

            // Camera sweep
            camera.position.lerp(new THREE.Vector3(0, 80, 0), 0.02);
            camera.lookAt(0, 0, 0);

            if (progress < 1) {
                requestAnimationFrame(syncAnim);
            } else {
                completeSync();
            }
        }
        syncAnim();
    }

    function completeSync() {
        splash.classList.add('fading');
        setTimeout(() => {
            splash.style.display = 'none';
            content.style.display = 'block';
            setTimeout(() => {
                content.style.opacity = '1';
                document.body.classList.add('synced');
                sessionStorage.setItem('neural-sync', 'complete');
            }, 100);
        }, 800);
    }

    trigger.addEventListener('click', () => {
        if (!scene) initThree();
        startSync();
    });

    window.addEventListener('resize', () => {
        if (renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });

    // Auto-init three for background vibe
    initThree();

})();
