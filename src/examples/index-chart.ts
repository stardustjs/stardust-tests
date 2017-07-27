import * as Stardust from "stardust-core";
import * as StardustWebGL from "stardust-webgl";
import { WebGL2DTestCase, registerTestCase, loadCSV } from "../common";

import * as d3 from "d3";

export class IndexChartTestCase extends WebGL2DTestCase {
    public glyphs: Stardust.Mark;
    public interp: Stardust.InterpolateScale;

    public async initialize(element: HTMLDivElement, width: number, height: number) {
        super.initialize(element, width, height);
        let platform = this.platform;
        d3.select(element).style("position", "relative");
        let svg = d3.select(element).append("svg");
        svg.attr("width", width).attr("height", height);
        svg.style("position", "absolute").style("pointer-events", "none");
        d3.select(this.canvas).style("position", "absolute");


        let margin_left = 70;
        let margin_right = 10;
        let margin_top = 10;
        let margin_bottom = 30;

        let data = await loadCSV("data/stock.csv");
        let names = ["MSFT", "AAPL", "IBM", "GOOGL", "AMZN"];
        let colorsOriginal = [
            [0x66, 0xc2, 0xa5],
            [0xfc, 0x8d, 0x62],
            [0x8d, 0xa0, 0xcb],
            [0xe7, 0x8a, 0xc3],
            [0xa6, 0xd8, 0x54]
        ];
        let colors = colorsOriginal.map((x) => [x[0] / 255, x[1] / 255, x[2] / 255, 1]);
        let polyline = Stardust.mark.polyline();

        let polylines = Stardust.mark.create(polyline, platform);

        let ranges = names.map((d) => {
            return [d3.min(data, (x) => +x[d]), d3.max(data, (x) => +x[d])];
        });

        let xScale = d3.scaleTime()
            .domain([d3.min(data, (d) => +d.Time * 1000), d3.max(data, (d) => +d.Time * 1000)])
            .range([margin_left, width - margin_right]);

        let yScale = Stardust.scale.linear()
            .domain([0, 1000])
            .range([height - margin_bottom, margin_top]);

        let legendItems = svg.append("g").selectAll("g").data(names)
            .enter().append("g")
        legendItems
            .attr("transform", (d, i) => `translate(${margin_left + 20}, ${margin_top + 20 * i + 10})`)
        legendItems.append("line")
            .attr("x1", 0).attr("x2", 15).attr("y1", 0).attr("y2", 0)
            .style("stroke", (d, i) => `rgb(${colorsOriginal[i].join(",")})`);
        legendItems.append("text")
            .attr("x", 20).attr("y", 5).text(d => d)
            .style("fill", (d, i) => `rgb(${colorsOriginal[i].join(",")})`);

        svg.append("g")
            .classed("axis", true)
            .attr("transform", `translate(0, ${height - margin_bottom})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));
        let gYAxis = svg.append("g")
            .classed("axis", true)
            .attr("transform", `translate(${margin_left}, 0)`)

        let hline = svg.append("line")
            .classed("hline", true)
            .attr("x1", margin_left)
            .attr("x2", width - margin_right)
        let vline = svg.append("line")
            .classed("vline", true)
            .attr("y1", margin_top)
            .attr("y2", height - margin_bottom)

        let indexScale = d3.scaleLinear()
            .domain([1 / 3, 3])
            .range(yScale.range() as number[]);

        polylines
            .attr("p", Stardust.scale.Vector2(d => xScale(d.time), yScale(d => d.value)))
            .attr("width", 1)
            .attr("color", [0, 0, 0, 0.4]);

        let refIdx = 0;

        polylines.instance((d, i) => {
            return data.map((x) => {
                return { time: +x.Time * 1000, value: +x[d] };
            })
        }, (d, i) => {
            yScale.domain([data[refIdx][d] * indexScale.domain()[0], data[refIdx][d] * indexScale.domain()[1]]);
            return { color: colors[i] };
        });

        polylines.data(names);

        let rerender = () => {
            indexScale.domain([
                d3.min(ranges, (x, i) => x[0] / data[refIdx][names[i]]),
                d3.max(ranges, (x, i) => x[1] / data[refIdx][names[i]])
            ]);
            hline.attr("y1", indexScale(1));
            hline.attr("y2", indexScale(1));
            vline.attr("x1", xScale(+data[refIdx].Time * 1000));
            vline.attr("x2", xScale(+data[refIdx].Time * 1000));
            gYAxis.call(d3.axisLeft(indexScale).tickFormat(d3.format(".0%")));
            platform.clear();
            polylines.render();
        }

        rerender();

        d3.select(this.canvas).on("mousemove", () => {
            let left = this.canvas.getBoundingClientRect().left;
            let x = d3.event.clientX;
            let d3xscale = d3.scaleLinear().domain(xScale.domain()).range(xScale.range());
            let t = d3xscale.invert(x - left) / 1000;
            let idx = Math.floor((t - data[0].Time) / (data[data.length - 1].Time - data[0].Time) * (data.length - 1));
            idx = Math.max(Math.min(idx, data.length - 1), 0);
            refIdx = idx;
            requestAnimationFrame(rerender);
        });
    }
}

registerTestCase({
    name: "Index Chart",
    group: "Basic Charts",
    order: 0,
    construct: () => new IndexChartTestCase()
})