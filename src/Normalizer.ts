import Bezier = require('bezier-js');

import { Transformer } from './Transformer';

export class Normalizer {
	constructor(protected transformer: Transformer) {}

	public normalize(
		bezier: Bezier,
		toLengths: {
			x: number;
			y: number;
		} = { x: 1, y: 1 },
		toPoint: BezierJs.Point = { x: 0, y: 0 },
	): Bezier {
		const stretched = this.transformer.stretch(bezier, toLengths);
		const shifted = this.transformer.shift(stretched, toPoint);
		return shifted;
	}
}
