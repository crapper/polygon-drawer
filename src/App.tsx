import { get } from 'http';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Star, Text, Rect, Circle } from 'react-konva';

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
  x: number; // center X
  y: number; // center Y
  width: number;
  height: number;
}

export interface RectObject {
  rect: RectSpec;
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
export const ALL_ANCHORS: Readonly<Vector>[] = [TOP_LEFT, TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT];

export enum Anchor {
  TOP_LEFT,
  TOP,
  TOP_RIGHT,
  RIGHT,
  BOTTOM_RIGHT,
  BOTTOM,
  BOTTOM_LEFT,
  LEFT
}

export function getAnchorPos(rect: RectSpec, anchorVec: Vector): Vector { //get specific anchor position
  return new Vector(rect.x, rect.y).add(anchorVec.multiply(new Vector(rect.width / 2, rect.height / 2)));
}

export function transformRectSpec(oldRect: RectSpec, oldAnchorVec: Vector, newAnchorPos: Vector): RectSpec {
  const oldAnchorPos = getAnchorPos(oldRect, oldAnchorVec); // old anchor position
  const diagonalAnchorPos = getAnchorPos(oldRect, oldAnchorVec.multiply(new Vector(-1, -1))); // get opposite of old anchor position
  const correctedNewAnchorPos = oldAnchorPos.add(newAnchorPos.subtract(oldAnchorPos).multiply(oldAnchorVec).multiply(oldAnchorVec)); // 1. remove irrelevant axis by some x = 0/ y=0 2. prevent -1 affect anchor position
  const newRectCenter = correctedNewAnchorPos.add(diagonalAnchorPos).divide(new Vector(2, 2)); //
  const newRectWidth = oldAnchorVec.x === 0 ? oldRect.width : Math.abs(correctedNewAnchorPos.x - diagonalAnchorPos.x);
  const newRectHeight = oldAnchorVec.y === 0 ? oldRect.height : Math.abs(correctedNewAnchorPos.y - diagonalAnchorPos.y);

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

function makeID(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function generateShapes(): RectObject[] {
  let rectspec: RectSpec
  let x = Math.random() * window.innerWidth;
  let y = Math.random() * window.innerHeight;
  rectspec = createRectSpec(x, y, x + 50, y + 50)
  return [{ rect: rectspec, id: makeID(10), rotation: 0, isDragging: true }];
}

const INITIAL_STATE = generateShapes();


export function RectElement(props: { rectObject: RectObject, setSelected: React.Dispatch<React.SetStateAction<string | null>> }) {
  const { rectObject, setSelected } = props;

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const width = rectObject.rect.width;
    const height = rectObject.rect.height;
    rectObject.rect = {
      x: e.target.x() - width / 2,
      y: e.target.y() - height / 2,
      width: width,
      height: height,
    }
  }

  return <Rect
    id={rectObject.id}
    x={rectObject.rect.x + rectObject.rect.width / 2}
    y={rectObject.rect.y + rectObject.rect.height / 2}
    width={rectObject.rect.width}
    height={rectObject.rect.height}
    numPoints={6}
    innerRadius={20}
    outerRadius={40}
    fill="#89b717"
    opacity={0.8}
    draggable
    rotation={rectObject.rotation}
    scaleX={rectObject.isDragging ? 1.2 : 1}
    scaleY={rectObject.isDragging ? 1.2 : 1}
    onClick={(e) => { setSelected(rectObject.id) }}
    onDragMove={(e) => { handleDragMove(e) }}
  />
}


export default function App() {
  const [rectObjects, setlst] = React.useState<RectObject[]>(INITIAL_STATE);
  // const [points, setPoints] = React.useState<CircleObject[]>([]);
  // const [onCircle, setOnCircle] = React.useState(true);
  const [selected, setSelected] = React.useState<string | null>(null);

  function findRectObject(id: string) {
    return rectObjects.find((r) => r.id === id);
  }


  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text text="Try to drag a star" />
        {rectObjects.map((star) => (
          <RectElement key={star.id} rectObject={star} setSelected={setSelected} />
        ))}

      </Layer>
    </Stage>
  );
};
