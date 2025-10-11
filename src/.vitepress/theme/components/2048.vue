<template>
    <div class="game-wrapper">
        <div class="header">
            <h1>2048</h1>
            <div class="controls">
                <span>使用wasd上下左右进行移动</span>
                <button @click="initGame" class="restart-button">Restart Game</button>
            </div>
        </div>
        <!-- three.js 的 canvas 将会挂载到这个 div -->
        <div ref="gameContainer" class="game-container" tabindex="0" @keydown="handleKeydown"></div>
        <div v-if="gameOver" class="game-over">Game Over!</div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import gsap from 'gsap';

// --- 核心游戏逻辑状态 ---
const board = ref(Array(4).fill().map(() => Array(4).fill(0)));
const gameOver = ref(false);
const gameContainer = ref(null);
let isAnimating = false; // 动画锁，防止动画期间的额外输入

// --- Three.js 相关变量 ---
let scene, camera, renderer;
let tileMeshes = []; // 用一个二维数组存储所有卡片的 Mesh 对象，与 board 对应

// --- 游戏视觉参数 ---
const BOARD_SIZE = 4;
const CELL_SIZE = 2; // three.js 中的单元格大小
const GAP_SIZE = 0.2; // 单元格间隙
const TILE_DEPTH = 0.2; // 卡片厚度

// --- 游戏初始化 ---
function initGame() {
    isAnimating = false;
    gameOver.value = false;
    board.value = Array(4).fill().map(() => Array(4).fill(0));

    // 清理three.js场景中的旧卡片
    tileMeshes.flat().forEach(mesh => {
        if (mesh) {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
    });
    tileMeshes = Array(4).fill().map(() => Array(4).fill(null));

    // 添加两个初始卡片
    addRandomTile();
    addRandomTile();

    if (gameContainer.value) {
        gameContainer.value.focus();
    }
}

// --- Three.js 场景设置 ---
function initThree() {
    const container = gameContainer.value;
    if (!container) return;

    // 1. 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbada0);

    // 2. 相机 (使用正交相机，更适合2048)
    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = (BOARD_SIZE * CELL_SIZE + (BOARD_SIZE + 1) * GAP_SIZE);
    camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // 3. 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 4. 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // 5. 创建棋盘背景格子
    createBoardGrid();

    // 6. 动画循环
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };
    animate();

    // 窗口大小调整
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    const container = gameContainer.value;
    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = (BOARD_SIZE * CELL_SIZE + (BOARD_SIZE + 1) * GAP_SIZE);

    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
}


function createBoardGrid() {
    const gridGeom = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE);
    const gridMat = new THREE.MeshStandardMaterial({ color: 0xcdc1b4 });

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const gridCell = new THREE.Mesh(gridGeom, gridMat);
            const { x, y } = get3DPosition(i, j);
            gridCell.position.set(x, y, -TILE_DEPTH / 2 - 0.01); // 放在卡片下方
            scene.add(gridCell);
        }
    }
}


// --- 核心辅助函数: 创建和管理 3D 卡片 ---

// 将 (i, j) 棋盘坐标转换为 3D 世界坐标
function get3DPosition(i, j) {
    const totalSize = BOARD_SIZE * CELL_SIZE + (BOARD_SIZE - 1) * GAP_SIZE;
    return {
        x: j * (CELL_SIZE + GAP_SIZE) - totalSize / 2 + CELL_SIZE / 2,
        y: -i * (CELL_SIZE + GAP_SIZE) + totalSize / 2 - CELL_SIZE / 2,
    };
}

// 获取不同数字的颜色
function getTileColors(value) {
    const colors = {
        2: { bg: '#eee4da', text: '#776e65' },
        4: { bg: '#ede0c8', text: '#776e65' },
        8: { bg: '#f2b179', text: '#f9f6f2' },
        16: { bg: '#f59563', text: '#f9f6f2' },
        32: { bg: '#f67c5f', text: '#f9f6f2' },
        64: { bg: '#f65e3b', text: '#f9f6f2' },
        128: { bg: '#edcf72', text: '#f9f6f2' },
        256: { bg: '#edcc61', text: '#f9f6f2' },
        512: { bg: '#edc850', text: '#f9f6f2' },
        1024: { bg: '#edc53f', text: '#f9f6f2' },
        2048: { bg: '#edc22e', text: '#f9f6f2' },
    };
    return colors[value] || { bg: '#3c3a32', text: '#f9f6f2' };
}

// 动态创建带有数字的 CanvasTexture
function createTileTexture(value) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    const { bg, text } = getTileColors(value);

    // 背景
    context.fillStyle = bg;
    context.fillRect(0, 0, 256, 256);

    // 文字
    context.fillStyle = text;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    let fontSize = value < 100 ? 120 : (value < 1000 ? 100 : 80);
    context.font = `bold ${fontSize}px Arial`;
    context.fillText(value, 128, 128);

    return new THREE.CanvasTexture(canvas);
}

// 创建一个卡片 Mesh 对象
function createTile(value, i, j) {
    const geometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, TILE_DEPTH);
    const texture = createTileTexture(value);
    const material = new THREE.MeshStandardMaterial({ map: texture });

    const mesh = new THREE.Mesh(geometry, material);
    const { x, y } = get3DPosition(i, j);
    mesh.position.set(x, y, 0);

    return mesh;
}

// --- 游戏逻辑与动画集成 ---

function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board.value[i][j] === 0) {
                emptyCells.push({ i, j });
            }
        }
    }

    if (emptyCells.length > 0) {
        const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = 2;
        board.value[i][j] = value;

        // 创建新的 3D 卡片并添加入场动画
        const newTileMesh = createTile(value, i, j);
        tileMeshes[i][j] = newTileMesh;
        scene.add(newTileMesh);

        // 使用 GSAP 实现新卡片出现动画
        newTileMesh.scale.set(0, 0, 0);
        gsap.to(newTileMesh.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.3,
            ease: 'back.out(1.7)'
        });
    }
}

// 新的 move 函数: 计算动画指令并执行
function move(direction) {
    if (gameOver.value || isAnimating) return;

    const animationQueue = [];
    const newBoard = JSON.parse(JSON.stringify(board.value));
    const tempTileMeshes = tileMeshes.map(row => [...row]); // 临时网格引用
    let moved = false;

    const
        vectors = {
            up: { i: -1, j: 0 },
            down: { i: 1, j: 0 },
            left: { i: 0, j: -1 },
            right: { i: 0, j: 1 },
        };
    const vector = vectors[direction];

    // 遍历顺序：与移动方向相反，以确保先移动远离边界的卡片
    const traverseI = direction === 'down' ? [...Array(BOARD_SIZE).keys()].reverse() : [...Array(BOARD_SIZE).keys()];
    const traverseJ = direction === 'right' ? [...Array(BOARD_SIZE).keys()].reverse() : [...Array(BOARD_SIZE).keys()];

    traverseI.forEach(i => {
        traverseJ.forEach(j => {
            if (newBoard[i][j] === 0) return;

            let currentI = i, currentJ = j;
            let nextI = i + vector.i, nextJ = j + vector.j;

            // 寻找最远的可移动/合并位置
            while (nextI >= 0 && nextI < BOARD_SIZE && nextJ >= 0 && nextJ < BOARD_SIZE) {
                if (newBoard[nextI][nextJ] === 0) {
                    currentI = nextI;
                    currentJ = nextJ;
                } else if (newBoard[nextI][nextJ] === newBoard[i][j]) {
                    currentI = nextI;
                    currentJ = nextJ;
                    break;
                } else {
                    break;
                }
                nextI += vector.i;
                nextJ += vector.j;
            }

            if (currentI !== i || currentJ !== j) {
                moved = true;
                const movingMesh = tempTileMeshes[i][j];
                const originalValue = newBoard[i][j];

                if (newBoard[currentI][currentJ] === 0) { // 移动
                    newBoard[currentI][currentJ] = originalValue;
                    newBoard[i][j] = 0;
                    tempTileMeshes[currentI][currentJ] = movingMesh;
                    tempTileMeshes[i][j] = null;
                    animationQueue.push({ type: 'move', mesh: movingMesh, from: { i, j }, to: { i: currentI, j: currentJ } });
                } else { // 合并
                    newBoard[currentI][currentJ] *= 2;
                    newBoard[i][j] = 0;
                    const targetMesh = tempTileMeshes[currentI][currentJ];
                    tempTileMeshes[i][j] = null;
                    animationQueue.push({ type: 'merge', mesh: movingMesh, targetMesh, to: { i: currentI, j: currentJ }, newValue: newBoard[currentI][currentJ] });
                }
            }
        });
    });

    if (moved) {
        isAnimating = true;
        board.value = newBoard; // 先更新数据模型以获得新值
        tileMeshes = tempTileMeshes; // 更新网格引用
        runAnimations(animationQueue);
    }
}

function runAnimations(queue) {
    const tl = gsap.timeline({
        onComplete: () => {
            // 动画完成后，清理合并掉的卡片
            queue.filter(anim => anim.type === 'merge').forEach(anim => {
                scene.remove(anim.mesh);
                anim.mesh.geometry.dispose();
                anim.mesh.material.dispose();
            });

            // 添加新卡片并检查游戏结束
            addRandomTile();
            checkGameOver();
            isAnimating = false;
        }
    });

    queue.forEach(anim => {
        const { x, y } = get3DPosition(anim.to.i, anim.to.j);

        if (anim.type === 'move') {
            tl.to(anim.mesh.position, { x, y, duration: 0.2, ease: 'power1.inOut' }, "<");
        } else if (anim.type === 'merge') {
            // 移动的卡片
            tl.to(anim.mesh.position, { x, y, duration: 0.2, ease: 'power1.inOut' }, "<");
            // 目标卡片更新材质 + "pop" 动画
            tl.add(() => {
                // 更新贴图
                anim.targetMesh.material.map = createTileTexture(anim.newValue);
                anim.targetMesh.material.needsUpdate = true;

                // Pop 动画
                gsap.fromTo(anim.targetMesh.scale,
                    { x: 1, y: 1, z: 1 },
                    { x: 1.2, y: 1.2, z: 1.2, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' }
                );
            }, ">-0.05"); // 在移动动画快结束时执行
        }
    });
}


function checkGameOver() {
    let hasEmpty = false;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board.value[i][j] === 0) hasEmpty = true;
            if (i < 3 && board.value[i][j] === board.value[i + 1][j]) return;
            if (j < 3 && board.value[i][j] === board.value[i][j + 1]) return;
        }
    }
    if (!hasEmpty) gameOver.value = true;
}

function handleKeydown(event) {
    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
    }

    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            move('left'); break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            move('up'); break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            move('right'); break;
        case 'ArrowDown':
        case 's':
        case 'S':
            move('down'); break;
    }
}

// --- Vue 生命周期钩子 ---
onMounted(() => {
    initThree();
    initGame();
});

onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
    // 可选的three.js资源清理
});

</script>

<style scoped>
.game-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Arial, sans-serif;
    background-color: #faf8ef;
    padding: 20px;
}

.header {
    width: 500px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

h1 {
    font-size: 32px;
    color: #776e65;
}

.controls {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.controls span {
    color: #776e65;
    margin-bottom: 10px;
}

/* 我们的主要画布容器 */
.game-container {
    width: 500px;
    height: 500px;
    background-color: #bbada0;
    border-radius: 6px;
    outline: none;
    position: relative;
}

.game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(238, 228, 218, 0.73);
    padding: 30px;
    border-radius: 10px;
    font-size: 48px;
    color: #776e65;
    font-weight: bold;
    z-index: 100;
}

.restart-button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #8f7a66;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.restart-button:hover {
    background-color: #7c6a5a;
}
</style>
