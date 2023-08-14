
export class Vector {
  constructor(public x: number, public y: number) { }

  add(other: Vector) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  multiply(other: Vector) {
    return new Vector(this.x * other.x, this.y * other.y);
  }

  divide(other: Vector) {
    return new Vector(this.x / other.x, this.y / other.y);
  }

  distance(other: Vector) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }

  setXY(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector(this.x, this.y);
  }
}

export interface RectSpec {
  x: number; // center X, Cartesian
  y: number; // center Y, Cartesian
  width: number;
  height: number;
}

export interface RectObject extends RectSpec {
  id: string;
  rotation?: number;
  isDragging?: boolean;
}

export interface CircleObject {
  x: number; // center X
  y: number; // center Y
  id: string;
  radius: number;
}

// type a = {x: 1, y: 1};

export const TOP_LEFT: Readonly<Vector> = new Vector(-1, 1);
export const TOP: Readonly<Vector> = new Vector(0, 1);
export const TOP_RIGHT: Readonly<Vector> = new Vector(1, 1);
export const RIGHT: Readonly<Vector> = new Vector(1, 0);
export const BOTTOM_RIGHT: Readonly<Vector> = new Vector(1, -1);
export const BOTTOM: Readonly<Vector> = new Vector(0, -1);
export const BOTTOM_LEFT: Readonly<Vector> = new Vector(-1, -1);
export const LEFT: Readonly<Vector> = new Vector(-1, 0);
export const ALL_ANCHORS = [TOP_LEFT, TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT] as const;

export function getAlignedAnchorPos(targetPos: Vector, alignmentPos: Vector, alignmentVec: Vector): Vector {
  // 1. remove irrelevant axis by some x = 0/ y=0 2. prevent -1 affect anchor position
  return alignmentPos.add(targetPos.subtract(alignmentPos).multiply(alignmentVec).multiply(alignmentVec));
}

export function getAnchorPos(rect: RectSpec, anchorVec: Vector): Vector { //get specific anchor position
  return new Vector(rect.x, rect.y).add(anchorVec.multiply(new Vector(rect.width / 2, rect.height / 2)));
}

export function getAnchorVec(rect: RectSpec, anchorPos: Vector) {
  return anchorPos.subtract(new Vector(rect.x, rect.y)).divide(new Vector(rect.width / 2, rect.height / 2));
}

export function transformRectSpec(oldRect: RectSpec, oldAnchorVec: Vector, newAnchorPos: Vector): RectSpec {
  const oldAnchorPos = getAnchorPos(oldRect, oldAnchorVec); // old anchor position
  const diagonalAnchorPos = getAnchorPos(oldRect, oldAnchorVec.multiply(new Vector(-1, -1))); // get opposite of old anchor position
  const alignedNewAnchorPos = getAlignedAnchorPos(newAnchorPos, oldAnchorPos, oldAnchorVec);
  const newRectCenter = alignedNewAnchorPos.add(diagonalAnchorPos).divide(new Vector(2, 2)); //
  const newRectWidth = oldAnchorVec.x === 0 ? oldRect.width : Math.abs(alignedNewAnchorPos.x - diagonalAnchorPos.x);
  const newRectHeight = oldAnchorVec.y === 0 ? oldRect.height : Math.abs(alignedNewAnchorPos.y - diagonalAnchorPos.y);

  return {
    x: newRectCenter.x,
    y: newRectCenter.y,
    width: newRectWidth,
    height: newRectHeight
  };
}

export function createRectSpec(topLeftX: number, topLeftY: number, bottomRightX: number, bottomRightY: number): RectSpec {
  const width = bottomRightX - topLeftX;
  const height = topLeftY - bottomRightY;
  return {
    x: topLeftX + width / 2,
    y: bottomRightY + height / 2,
    width,
    height
  };
}
