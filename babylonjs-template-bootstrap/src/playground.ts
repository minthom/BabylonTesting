document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

    // Check if the canvas element is found
    if (!canvas) {
        console.error("Canvas element not found!");
        return; // Exit if canvas is not found
    }

    // Initialize the Babylon.js engine with the canvas
    const engine = new BABYLON.Engine(canvas, true);

    // Call the CreateScene method to set up the scene and start rendering
    const scene = Playground.CreateScene(engine, canvas);

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", () => {
        engine.resize();
    });
});


class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(engine);

        // This creates and positions an arc-rotate camera (non-mesh)
        var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        // Get the Babylon.js audio engine, audio context, and master gain node.
        const audioEngine = BABYLON.Engine.audioEngine!;
        const audioContext = audioEngine.audioContext!;
        const masterGainNode = audioEngine.masterGain;

        // Add test tones. Left speaker gets a 440 Hz sine wave, right speaker gets a 660 Hz sine wave.
        const leftSound = new OscillatorNode(audioContext, { frequency: 440 });
        const rightSound = new OscillatorNode(audioContext, { frequency: 660 });

        // Add panner nodes to position the sound sources to the left and right.
        const leftPanner = new StereoPannerNode(audioContext, { pan: -1 });
        const rightPanner = new StereoPannerNode(audioContext, { pan: 1 });

        // Connect the left and right sound sources to the panner nodes.
        leftSound.connect(leftPanner);
        rightSound.connect(rightPanner);

        // Connect the panner nodes to the audio engine's master gain node.
        leftPanner.connect(masterGainNode);
        rightPanner.connect(masterGainNode);

        // Reduce the master gain volume.
        masterGainNode.gain.value = 0.1;

        // Start the sound sources.
        leftSound.start();
        rightSound.start();

        // Toggle the audio engine lock on user interaction.
        document.addEventListener("click", () => {
            if (audioContext.state === "suspended") {
                audioContext.resume().then(() => console.log("Audio context resumed"));
            } else if (audioContext.state === "running") {
                audioContext.suspend().then(() => console.log("Audio context suspended"));
            }
        });

        // Add analyzer node and connect it to the end of the audio graph.
        const analyzer = new AnalyserNode(audioContext);
        masterGainNode.connect(analyzer);

        const freqData = new Float32Array(analyzer.frequencyBinCount);

        // Create fullscreen dynamic texture for visualization
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("AudioImageTexture");
        const ctx = advancedTexture.getContext();

        // Function to draw the frequency data
        scene.onAfterRenderObservable.add(() => {
            // Get updated frequency data
            analyzer.getFloatFrequencyData(freqData);

            // Check if ctx is not null before using it
            if (!ctx) {
                console.error("Canvas context is null.");
                return;
            }

            // Clear the canvas and draw the frequency data
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // You can visualize the frequency data here (draw bars, lines, etc.)
            const barWidth = canvas.width / freqData.length;
            for (let i = 0; i < freqData.length; i++) {
                const barHeight = (freqData[i] + 140) * 2; // Adjust to make the bars visible
                ctx.fillStyle = `rgb(${Math.abs(barHeight)}, 50, 100)`; // Example color should be okay for now
                ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight); // Draw bar
            }

            // Update the texture
            advancedTexture.update();
        });

        return scene;
    }
}

// Declaration for dat variable
declare var dat: any;

// Export the Playground class
export { Playground };
