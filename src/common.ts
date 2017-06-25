import * as Stardust from "stardust-core";
import * as StardustWebGL from "stardust-webgl";
import * as d3 from "d3";

export class TestCase {
    public timer: number;

    public async initialize(element: HTMLDivElement, width: number, height: number) {}
    public async uninitialize() {
        if(this.timer != undefined) {
            cancelAnimationFrame(this.timer);
        }
    }

    public startAnimation() {
        let t0 = new Date().getTime();
        let onFrame = () => {
            let t = (new Date().getTime() - t0) / 1000;
            this.render(t);
            this.timer = requestAnimationFrame(onFrame);
        };
        requestAnimationFrame(onFrame);
    }

    public render(t: number) {}
}

export class WebGL3DTestCase extends TestCase {
    public canvas: HTMLCanvasElement;
    public platform: StardustWebGL.WebGLCanvasPlatform3D;
    public width: number;
    public height: number;

    public async initialize(element: HTMLDivElement, width: number, height: number) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width * 2;
        this.canvas.height = height * 2;
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.width = width;
        this.height = height;
        element.appendChild(this.canvas);

        this.platform = new StardustWebGL.WebGLCanvasPlatform3D(this.canvas, this.width, this.height);
        this.platform.set3DView(Math.PI / 2, width / height);
        this.platform.setPose(new Stardust.Pose(
            new Stardust.Vector3(0, 0, 200),
            new Stardust.Quaternion(0, 0, 0, 1)
        ));
    }
}

export class WebGL2DTestCase extends TestCase {
    public canvas: HTMLCanvasElement;
    public platform: StardustWebGL.WebGLCanvasPlatform2D;
    public width: number;
    public height: number;

    public async initialize(element: HTMLDivElement, width: number, height: number) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width * 2;
        this.canvas.height = height * 2;
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.width = width;
        this.height = height;
        element.appendChild(this.canvas);

        this.platform = new StardustWebGL.WebGLCanvasPlatform2D(this.canvas, this.width, this.height);
    }
}

export interface TestCaseDescription {
    name: string;
    group: string;
    order: number;

    construct: () => TestCase;
}

let testCases = new Map<string, TestCaseDescription>();

export function registerTestCase(desc: TestCaseDescription) {
    testCases.set(desc.name, desc);
}

export function getTestCases(): TestCaseDescription[] {
    let r: TestCaseDescription[] = [];
    testCases.forEach((c) => {
        r.push(c);
    });
    return r;
}

export function createTestCase(desc: TestCaseDescription): TestCase {
    return desc.construct();
}

export async function loadCSV(name: string) {
    return new Promise<any[]>((resolve, reject) => {
        d3.csv(name, (error, data) => {
            if(error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

export async function loadTSV(name: string) {
    return new Promise<any[]>((resolve, reject) => {
        d3.tsv(name, (error, data) => {
            if(error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

export async function loadJSON(name: string) {
    return new Promise<any>((resolve, reject) => {
        d3.json(name, (error, data) => {
            if(error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

import "./examples/scatterplot";
import "./examples/sanddance";
import "./examples/parametric-functions";
import "./examples/index-chart";
import "./examples/squares";
import "./examples/graph";