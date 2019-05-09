import Bezier = require('bezier-js');

import { Axis } from './Axis';
import { Normalizer } from './Normalizer';
import { Split } from './Split';
import { Splitter } from './Splitter';
import { Transformer } from './Transformer';

export type SplitMode = 'work' | 'time';

export class CssBezier {
	public point0: BezierJs.Point = { x: 0, y: 0 };
	public point4: BezierJs.Point = { x: 1, y: 1 };

	private bezier: Bezier;
	private splitter: Splitter = new Splitter();
	private transformer: Transformer = new Transformer(); // todo: ioc
	private normalizer: Normalizer = new Normalizer(this.transformer); // todo: ioc

	constructor(public point1: BezierJs.Point, public point2: BezierJs.Point) {
		this.checkPoint(point1);
		this.checkPoint(point2);
		this.bezier = new Bezier(this.point0, this.point1, this.point2, this.point4);
	}

	public splitEqually(
		numberOfSplits: number,
		durationMs: number,
		splitMode: SplitMode = 'work',
	): Array<{ delay: number; duration: number; easing: string; bezier: Bezier }> {
		const lineAxis = this.getLineAxis(splitMode);
		const lines = this.generateLines(numberOfSplits, lineAxis);
		const splits = this.splitter.split(this.bezier, lines);
		const normalized = this.normalizeSplits(splits);

		return normalized.map(split => {
			return {
				bezier: split.bezier,
				delay:
					splitMode === 'work'
						? parseFloat((durationMs * split.offsetInOrigin.x).toFixed(10))
						: parseFloat((durationMs * split.offsetInOrigin.y).toFixed(10)),
				duration:
					splitMode === 'work'
						? parseFloat((durationMs * split.expansionInOrigin.x).toFixed(10))
						: parseFloat((durationMs * split.expansionInOrigin.y).toFixed(10)),
				easing: `cubic-bezier(${split.bezier.points[1].x}, ${split.bezier.points[1].y}, ${
					split.bezier.points[2].x
				}, ${split.bezier.points[2].y})`,
			};
		});
	}

	public splitWorkEqually(
		numberOfSplits: number,
		durationMs: number,
	): Array<{ delay: number; duration: number; easing: string; bezier: Bezier }> {
		return this.splitEqually(numberOfSplits, durationMs);
	}

	private normalizeSplits(splits: Split[]): Split[] {
		return splits.map(
			split => new Split(this.normalizer.normalize(split.bezier), split.expansionInOrigin, split.offsetInOrigin),
		);
	}

	private generateLines(numberOfSplits: number, axis: Axis): BezierJs.Line[] {
		const result: BezierJs.Line[] = [];
		const interval = 1 / numberOfSplits;
		const defX = axis === Axis.x;
		const defY = axis === Axis.y;

		for (let i = 0; i <= numberOfSplits; i++) {
			const offset = interval * i;
			const p1 = { x: defX ? 0 : offset, y: defY ? 0 : offset };
			const p2 = { x: defX ? 1 : offset, y: defY ? 1 : offset };
			result.push({ p1, p2 });
		}
		return result;
	}

	private getLineAxis(splitMode: SplitMode) {
		switch (splitMode) {
			case 'work':
				return Axis.x;
			case 'time':
				return Axis.y;
		}
	}

	private checkPoint(point: BezierJs.Point): boolean {
		if (point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) {
			throw new Error('This library does only support points located between 0 and 1 for css cubic beziers');
		}
		return true;
	}
}
