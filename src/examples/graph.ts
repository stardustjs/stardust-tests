
import * as Stardust from "stardust-core";
import * as StardustWebGL from "stardust-webgl";
import { WebGL2DTestCase, registerTestCase, loadJSON } from "../common";

import * as d3 from "d3";

export class GraphTestCase extends WebGL2DTestCase {
    public force: d3.Simulation<any, any>;

    public async initialize(element: HTMLDivElement, width: number, height: number) {
        super.initialize(element, width, height);
        let platform = this.platform;
        var snodes = Stardust.mark.create(Stardust.mark.circle(8), platform);
        var snodesBG = Stardust.mark.create(Stardust.mark.circle(8), platform);
        var snodesSelected = Stardust.mark.create(Stardust.mark.circle(8), platform);
        var sedges = Stardust.mark.create(Stardust.mark.line(), platform);

        let data = await loadJSON("data/facebook_1912_clusters.json");
        var nodes = data.nodes;
        var edges = data.edges;
        var N = nodes.length;

        for (var i = 0; i < N; i++) {
            nodes[i].index = i;
            nodes[i].x = Math.random() * width;
            nodes[i].y = Math.random() * height;
        }

        let colors = [[31, 119, 180], [255, 127, 14], [44, 160, 44], [214, 39, 40], [148, 103, 189], [140, 86, 75], [227, 119, 194], [127, 127, 127], [188, 189, 34], [23, 190, 207]];
        colors = colors.map((x) => [x[0] / 255, x[1] / 255, x[2] / 255, 1]);

        snodes
            .attr("radius", 2)
            .attr("color", d => colors[d.cluster]);
        snodesBG
            .attr("radius", 3)
            .attr("color", [1, 1, 1, 0.5]);

        snodesSelected
            .attr("radius", 4)
            .attr("color", [228 / 255, 26 / 255, 28 / 255, 1]);

        sedges
            .attr("p1", (d) => [d.source.x, d.source.y])
            .attr("p2", (d) => [d.target.x, d.target.y])
            .attr("width", 0.5)
            .attr("color", d => {
                if (d.source.cluster == d.target.cluster) return colors[d.source.cluster].slice(0, 3).concat([0.1]);
                return [0.5, 0.5, 0.5, 0.1]
            });

        var force = d3.forceSimulation()
            .nodes(nodes);
        force.force("gravity", d3.forceCenter(width / 2, height / 2));
        force.force("link", d3.forceLink().links(edges).distance(50).strength(0.05));
        force.force("charge", d3.forceManyBody().strength(-40));
        force.restart();

        var positions = Stardust.array()
            .value(d => [d.x, d.y])
            .data(nodes);

        var positionScale = Stardust.scale.custom("array(pos, value)")
            .attr("pos", "Vector2Array", positions)
        snodesSelected.attr("center", positionScale(d => d.index));
        snodes.attr("center", positionScale(d => d.index));
        snodesBG.attr("center", positionScale(d => d.index));
        sedges.attr("p1", positionScale(d => d.source.index));
        sedges.attr("p2", positionScale(d => d.target.index));

        snodesBG.data(nodes);
        snodes.data(nodes);
        sedges.data(edges);

        force.on("tick", () => {
            positions.data(nodes);
            requestRender();
        });

        function requestRender() {
            requestAnimationFrame(render);
        }

        function render() {
            // Cleanup and re-render.
            platform.clear([1, 1, 1, 1]);
            sedges.render();
            snodesBG.render();
            snodes.attr("radius", 2);
            snodes.render();
        }

        this.force = force;
    }

    public async uninitialize() {
        this.force.stop();
    }
}

registerTestCase({
    name: "Graph",
    group: "Basic Charts",
    order: 0,
    construct: () => new GraphTestCase()
}) 