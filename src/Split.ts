import Bezier = require('bezier-js');

export class Split {
	constructor(
		public bezier: Bezier,
		public expansionInOrigin: {
			x: number;
			y: number;
		},
		public offsetInOrigin: {
			x: number;
			y: number;
		},
	) {}
}
