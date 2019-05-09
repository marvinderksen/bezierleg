import Bezier = require('bezier-js');

import { Split } from './Split';

export class Splitter {
	public split(bezier: Bezier, lines: BezierJs.Line[]): Split[] {
		const results: Split[] = [];
		const originBox = bezier.bbox();
		this.checkBox(originBox);

		for (let i = 0; i < lines.length - 1; i++) {
			const start = lines[i];
			const end = lines[i + 1];
			this.checkLines(start, end);

			const split = this.getSplit(bezier, start, end, originBox);
			results.push(split);
		}
		return results;
	}

	private getSplit(bezier: Bezier, start: BezierJs.Line, end: BezierJs.Line, originBox: BezierJs.BBox): Split {
		const intersects1 = bezier.intersects(start);
		const intersects2 = bezier.intersects(end);
		this.checkIntersects(intersects1, intersects2);

		const bezierSplit = bezier.split(intersects1[0] as number, intersects2[0] as number); // todo: casting => parsing?
		const splitBox = bezierSplit.bbox();
		this.checkBox(splitBox);

		const expansionInOrigin = this.getExpansionInOrigin(originBox, splitBox);
		const offsetInOrigin = this.getOffsetInOrigin(originBox, splitBox);
		return new Split(bezierSplit, expansionInOrigin, offsetInOrigin);
	}

	private getExpansionInOrigin(
		originBox: BezierJs.BBox,
		splitBox: BezierJs.BBox,
	): {
		x: number;
		y: number;
	} {
		return {
			x: splitBox.x.size! / originBox.x.size!,
			y: splitBox.y.size! / originBox.y.size!,
		};
	}

	private getOffsetInOrigin(
		originBox: BezierJs.BBox,
		splitBox: BezierJs.BBox,
	): {
		x: number;
		y: number;
	} {
		return {
			x: splitBox.x.min / originBox.x.size!,
			y: splitBox.y.min / originBox.y.size!,
		};
	}

	private checkBox(box: BezierJs.BBox): boolean {
		if (!box.x.size || !box.y.size) {
			throw new Error('Beziers with zero dimensions are not supported');
		}
		return true;
	}

	private checkIntersects(intersects1: string[] | number[], intersects2: string[] | number[]): boolean {
		if (intersects1.length === 1 && intersects2.length === 1) {
			return true;
		}
		throw new Error(`Each line must intersect the bezier at exactly one point`);
	}

	private checkLines(line1: BezierJs.Line, line2: BezierJs.Line): boolean {
		if (this.getLineAxis(line1) === this.getLineAxis(line2)) {
			return true;
		}
		throw new Error(`All lines must be parallel to the x or y axes and no axis may differ from the others`);
	}

	private getLineAxis(line: BezierJs.Line): 'x' | 'y' | undefined {
		return line.p1.x === line.p2.x ? 'y' : line.p1.y === line.p2.y ? 'x' : undefined;
	}
}
