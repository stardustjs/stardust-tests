import * as Stardust from "stardust-core";
import * as StardustWebGL from "stardust-webgl";
import { WebGL2DTestCase, registerTestCase, loadCSV } from "../common";

import * as d3 from "d3";

export class ScatterplotTestCase extends WebGL2DTestCase {
    public glyphs: Stardust.Mark;
    public interp: Stardust.InterpolateScale;

    public async initialize(element: HTMLDivElement, width: number, height: number) {
        super.initialize(element, width, height);
        let platform = this.platform;

        let margin = 10;
        let marginLeft = margin;
        let marginBottom = margin;

        // Declare the glyph with the custom mark type
        var glyphMark = Stardust.mark.compile(`
            import { Triangle } from P2D;

            mark Glyph(
                x: float, y: float,
                v1: float, v2: float, v3: float, v4: float,
                color: Color = [ 0, 0, 0, 0.8 ]
            ) {
                let c = Vector2(x, y);
                let p1 = Vector2(x + v1, y);
                let p2 = Vector2(x, y + v2);
                let p3 = Vector2(x - v3, y);
                let p4 = Vector2(x, y - v4);
                Triangle(c, p1, p2, color);
                Triangle(c, p2, p3, color);
                Triangle(c, p3, p4, color);
                Triangle(c, p4, p1, color);
            }
        `);

        // Create glyphs with our glyphMark
        var glyphs = Stardust.mark.create(glyphMark.Glyph, platform);

        var glyphSize = 20;

        var colors = [[228, 26, 28], [55, 126, 184], [77, 175, 74]].map((d) => [d[0] / 255, d[1] / 255, d[2] / 255, 0.8]);
        var cylinders2Color = [
            0, 0, 0, 0, 0, 1, 1, 2, 2
        ]

        let data = await loadCSV("data/car.csv");

        var scale1 = Stardust.scale.linear()
            .domain(d3.extent(data, d => d.Horsepower)).range([0, glyphSize]);
        var scale2 = Stardust.scale.linear()
            .domain(d3.extent(data, d => d.Weight)).range([0, glyphSize]);
        var scale3 = Stardust.scale.linear()
            .domain(d3.extent(data, d => d.Acceleration)).range([0, glyphSize]);
        var scale4 = Stardust.scale.linear()
            .domain(d3.extent(data, d => d.ModelYear)).range([0, glyphSize]);
        var scaleX1 = Stardust.scale.linear()
            .domain(d3.extent(data, d => d.MPG)).range([marginLeft, width - margin]);
        var scaleY1 = Stardust.scale.linear()
            .domain(d3.extent(data, d => d.Displacement)).range([margin, height - marginBottom]);

        var scaleX2 = Stardust.scale.linear()
            .domain(d3.extent(data, d => d.Weight)).range([marginLeft, width - margin]);
        var scaleY2 = Stardust.scale.linear()
            .domain(d3.extent(data, d => d.Acceleration)).range([margin, height - marginBottom]);

        var interp = Stardust.scale.interpolate()
        interp.t(0);

        glyphs
            .attr("x", interp(scaleX1(d => d.MPG), scaleX2(d => d.Weight)))
            .attr("y", interp(scaleY1(d => d.Displacement), scaleY2(d => d.Acceleration)))
            .attr("v1", interp(scale1(d => d.Horsepower), scale1(d => d.Horsepower)))
            .attr("v2", interp(scale2(d => d.Weight), scale1(d => d.Horsepower)))
            .attr("v3", interp(scale3(d => d.Acceleration), scale1(d => d.Horsepower)))
            .attr("v4", interp(scale4(d => d.ModelYear), scale1(d => d.Horsepower)))
            .attr("color", d => colors[cylinders2Color[d.Cylinders]]);

        glyphs.data(data);

        this.interp = interp;
        this.glyphs = glyphs;

        this.startAnimation();
    }

    public render(t: number) {
        this.interp.t(Math.sin(t) * Math.sin(t));
        this.platform.clear();
        this.glyphs.render();
    }
}

registerTestCase({
    name: "Scatterplot",
    group: "Basic Charts",
    order: 0,
    construct: () => new ScatterplotTestCase()
})