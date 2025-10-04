// Simple DSA visualizer module: bubble sort and insertion sort
(function () {
    const $ = (s) => document.querySelector(s);
    const $all = (s) => document.querySelectorAll(s);

    let running = false;
    let stopRequested = false;

    function parseArrayInput(input) {
        return input
            .split(',')
            .map(v => v.trim())
            .filter(v => v !== '')
            .map(v => Number(v))
            .filter(v => !Number.isNaN(v));
    }

    function renderArray(arr) {
        const container = document.getElementById('dsa-output');
        container.innerHTML = '';
        const max = Math.max(...arr, 1);
        arr.forEach((val, i) => {
            const bar = document.createElement('div');
            bar.className = 'dsa-bar';
            bar.style.height = Math.round((val / max) * 180) + 'px';
            bar.textContent = val;
            container.appendChild(bar);
        });
    }

    function sleep(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    async function bubbleSort(arr, speed, onStep) {
        const a = arr.slice();
        const n = a.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - 1 - i; j++) {
                if (stopRequested) return {arr: a, stopped: true};
                if (a[j] > a[j + 1]) {
                    [a[j], a[j + 1]] = [a[j + 1], a[j]];
                    onStep(a.slice(), {i, j});
                    await sleep(speed);
                }
            }
        }
        return {arr: a, stopped: false};
    }

    async function insertionSort(arr, speed, onStep) {
        const a = arr.slice();
        for (let i = 1; i < a.length; i++) {
            let key = a[i];
            let j = i - 1;
            while (j >= 0 && a[j] > key) {
                if (stopRequested) return {arr: a, stopped: true};
                a[j + 1] = a[j];
                j = j - 1;
                onStep(a.slice(), {i, j});
                await sleep(speed);
            }
            a[j + 1] = key;
            onStep(a.slice(), {i, j});
            await sleep(speed);
        }
        return {arr: a, stopped: false};
    }

    function highlightBars(indices) {
        const bars = document.querySelectorAll('#dsa-output .dsa-bar');
        bars.forEach(b => b.classList.remove('active', 'compare'));
        if (!indices) return;
        const {i, j} = indices;
        if (typeof i === 'number' && bars[i]) bars[i].classList.add('active');
        if (typeof j === 'number' && bars[j]) bars[j].classList.add('compare');
    }

    async function run() {
        if (running) return;
        const algo = $('#algorithm-select').value;
        const raw = $('#array-input').value || '';
        const arr = parseArrayInput(raw);
        if (arr.length === 0) {
            alert('Please enter a comma-separated list of numbers.');
            return;
        }
        const speed = Number($('#speed-range').value) || 250;

        running = true;
        stopRequested = false;
        $('#run-algo-btn').disabled = true;
        $('#stop-algo-btn').disabled = false;

        renderArray(arr);

        const onStep = (a, indices) => {
            renderArray(a);
            highlightBars(indices);
        };

        let result;
        if (algo === 'bubble') {
            result = await bubbleSort(arr, speed, onStep);
        } else {
            result = await insertionSort(arr, speed, onStep);
        }

        running = false;
        stopRequested = false;
        $('#run-algo-btn').disabled = false;
        $('#stop-algo-btn').disabled = true;

        if (!result.stopped) {
            renderArray(result.arr);
            highlightBars(null);
        }
    }

    function stop() {
        if (!running) return;
        stopRequested = true;
    }

    function init() {
        // attach events
        const runBtn = document.getElementById('run-algo-btn');
        const stopBtn = document.getElementById('stop-algo-btn');
        runBtn.addEventListener('click', run);
        stopBtn.addEventListener('click', stop);

        // provide a default example
        const input = document.getElementById('array-input');
        if (input && input.value.trim() === '') input.value = '5,3,8,1,2';

        // render default
        const arr = parseArrayInput(input.value || '5,3,8,1,2');
        renderArray(arr);
    }

    // Wait for DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
