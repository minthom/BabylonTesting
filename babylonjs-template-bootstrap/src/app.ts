import { Playground } from "./playground";

(() => {
    const canvas = <HTMLCanvasElement>document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);
    const scene = Playground.CreateScene(engine, canvas);

    window.addEventListener("DOMContentLoaded", () => {
        const canvas = <HTMLCanvasElement>document.getElementById("renderCanvas");
        if (!canvas) {
            console.error("Canvas element not found");
            return;
        }

        const engine = new BABYLON.Engine(canvas, true);
        const scene = Playground.CreateScene(engine, canvas);

        window.addEventListener("resize", () => {
            engine.resize();
        });

        engine.runRenderLoop(() => {
            scene.render();
        });
    });

    engine.runRenderLoop(() => {
        scene.render(true);
    });
})();
