import Bezier = require('bezier-js');

export class Transformer {
	public stretch(
		bezier: Bezier,
		toLengths: {
			x: number;
			y: number;
		} = { x: 1, y: 1 },
	): Bezier {
		const bbox = bezier.bbox();
		const factorX = toLengths.x / bbox.x.size!;
		const factorY = toLengths.y / bbox.y.size!;
		const points: BezierJs.Point[] = bezier.points.map((point: BezierJs.Point) => {
			return {
				x: point.x * factorX,
				y: point.y * factorY,
			};
		});
		return new Bezier(points);
	}

	public shift(bezier: Bezier, to: BezierJs.Point = { x: 0, y: 0 }): Bezier {
		const offsetX = bezier.points[0].x - to.x;
		const offsetY = bezier.points[0].y - to.y;
		const points: BezierJs.Point[] = bezier.points.map((point: BezierJs.Point) => {
			return {
				x: point.x - offsetX,
				y: point.y - offsetY,
			};
		});
		return new Bezier(points);
	}
}
