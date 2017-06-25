import * as Stardust from "stardust-core";
import * as StardustWebGL from "stardust-webgl";
import { WebGL2DTestCase, registerTestCase, loadCSV } from "../common";

import * as d3 from "d3";

export class ParametricFunctionsTestCase extends WebGL2DTestCase {
    public glyphs: Stardust.Mark;
    public interp: Stardust.InterpolateScale;

    public async initialize(element: HTMLDivElement, width: number, height: number) {
        super.initialize(element, width, height);
        let platform = this.platform;
        var circleMark = Stardust.mark.circle(8);

        var data = [];
        var N = 100000;
        for (var i = 0; i < N; i++) {
            data.push(i / N * Math.PI * 2);
        }

        // Color based on phase
        var scaleColor = Stardust.scale.custom(`hcl2rgb(Color(value + shift, 0.5, 0.5, 0.1))`);
        scaleColor.attr("shift", 0);

        var left = Stardust.mark.create(circleMark, platform);
        var scaleLeft = Stardust.scale.custom(`
            Vector2(
                (R - r) * cos(value) + d * cos((R / r - 1) * value),
                (R - r) * sin(value) - d * sin((R / r - 1) * value)
            ) * size + center
        `).attr("d", 2.19).attr("R", 5).attr("r", 5 * (18 / 41)).attr("size", 45).attr("center", "Vector2", [-13.33 + 250, 250]);
        left.attr("center", scaleLeft(d => d * 41));
        left.attr("radius", 1);
        left.attr("color", scaleColor(d => d * 41));
        left.data(data);



        var right = Stardust.mark.create(circleMark, platform);
        var scaleRight = Stardust.scale.custom(`
            Vector2(
                cos(a * value) - cos(b * value) * cos(b * value) * cos(b * value),
                sin(c * value) - sin(d * value) * sin(d * value) * sin(d * value)
            ) * size + center
        `).attr("a", 80).attr("b", 1).attr("c", 1).attr("d", 80).attr("size", 110).attr("center", "Vector2", [-13.33 * 2 + 1000 - 250, 250]);
        right.attr("center", scaleRight(d => d));
        right.attr("radius", 1);
        right.attr("color", scaleColor(d => d));
        right.data(data);

        this.left = left;
        this.right = right;
        this.scaleLeft = scaleLeft;
        this.scaleRight = scaleRight;
        this.scaleColor = scaleColor;

        this.startAnimation();
    }

    public left: Stardust.Mark;
    public right: Stardust.Mark;
    public scaleLeft: Stardust.CustomScale;
    public scaleRight: Stardust.CustomScale;
    public scaleColor: Stardust.CustomScale;

    public render(t: number) {
         this.scaleLeft.attr("d", 1.95 + Math.sin(t * 2) * 0.4);
            this.scaleColor.attr("shift", (t * 4) % (Math.PI * 2));
            this.left.render();
            this.right.render();

    }
}

registerTestCase({
    name: "Parametric Functions",
    group: "Basic Charts",
    order: 0,
    construct: () => new ParametricFunctionsTestCase()
}) 