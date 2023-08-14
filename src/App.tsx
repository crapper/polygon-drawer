import { get } from 'http';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Star, Text, Rect, Circle } from 'react-konva';
import { action, computed, makeAutoObservable, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { JsxElement } from 'typescript';

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
export const ALL_ANCHORS: Readonly<Vector>[] = [TOP_LEFT, TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT];

// export enum AnchorEnum {
//   TOP_LEFT,
//   TOP,
//   TOP_RIGHT,
//   RIGHT,
//   BOTTOM_RIGHT,
//   BOTTOM,
//   BOTTOM_LEFT,
//   LEFT
// }

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

function fromCartesianToCanvas(vecInCartesian: Vector): Vector {
  return vecInCartesian.multiply(new Vector(1, -1)).add(new Vector(window.innerWidth / 2, window.innerHeight / 2)); //x is same direction
}

function fromCanvasToCartesian(vecInCanvas: Vector): Vector {
  return vecInCanvas.subtract(new Vector(window.innerWidth / 2, window.innerHeight / 2)).multiply(new Vector(1, -1))
}

function generateShapes(): RectObject[] {
  // const x = Math.random() * window.innerWidth;
  // const y = Math.random() * window.innerHeight;
  const x = 0;
  const y = 0;
  return [{ x, y, width: 50, height: 50, id: makeID(10), rotation: 0, isDragging: true }];
}

const INITIAL_STATE = generateShapes();


export const RectElement = observer(function (props: { rectObject: RectObject, appController: AppController }) {
  const { rectObject, appController } = props;

  const posInCanvas = fromCartesianToCanvas(new Vector(rectObject.x, rectObject.y));

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    //e.target.x Canvas
    let vec = new Vector(e.target.x(), e.target.y()).add(new Vector(rectObject.width / 2, rectObject.height / 2)); // Canvas, make it become center again for the rectObject by add half of height and width
    vec = fromCanvasToCartesian(vec)
    rectObject.x = vec.x;
    rectObject.y = vec.y;
  }

  return <Rect
    id={rectObject.id}
    x={posInCanvas.x - rectObject.width / 2} // Canvas
    y={posInCanvas.y - rectObject.height / 2} // Canvas
    width={rectObject.width}
    height={rectObject.height}
    fill="#89b717"
    opacity={0.8}
    draggable
    rotation={rectObject.rotation}
    onClick={action((e) => { appController.selected = rectObject.id })}
    onDragMove={action(handleDragMove)}
  />
});

class AppController {
  rectObjects: RectObject[] = INITIAL_STATE;
  selected: string | null = null;
  constructor() {
    makeAutoObservable(this);
  }

  get selectedRectObject(): RectObject | undefined {
    return this.rectObjects.find((rectObject) => rectObject.id === this.selected);
  }

  findRectObjectById(id: string): RectObject | undefined {
    return this.rectObjects.find((rectObject) => rectObject.id === id);
  }
}

export const AnchorElement = observer(function (props: { anchorVec: Vector, rectObject: RectObject, appController: AppController }) {
  const { anchorVec, rectObject, appController } = props;
  const anchorPos = fromCartesianToCanvas(getAnchorPos(rectObject, anchorVec)); // Canvas
  return <Circle
    x={anchorPos.x} //canvas
    y={anchorPos.y}
    radius={5}
    fill="red"
    draggable
    onDragMove={action((e) => {
      const newAnchorPos = fromCanvasToCartesian(new Vector(e.target.x(), e.target.y())); //Cartesian
      const newRectSpec = transformRectSpec(rectObject, anchorVec, newAnchorPos); //Cartesian
      rectObject.x = newRectSpec.x;
      rectObject.y = newRectSpec.y;
      rectObject.width = newRectSpec.width;
      rectObject.height = newRectSpec.height;
      const constAnchorPos = fromCartesianToCanvas(getAnchorPos(rectObject, anchorVec)); //Canvas
      e.target.x(constAnchorPos.x);
      e.target.y(constAnchorPos.y);
    })}
  />
});

export const AnchorsElement = observer(function (props: { rectObject: RectObject, appController: AppController }) {
  const { rectObject, appController } = props;

  return <>
    {
      ALL_ANCHORS.map((anchorVec: Vector, idx) => {
        return <AnchorElement key={idx} anchorVec={anchorVec} rectObject={rectObject} appController={appController} />
      })
    }
    {/* <AnchorElement anchorVec={new Vector(0, 0)} rectObject={rectObject} appController={appController}/> */}
  </>
});


const App = observer(function () {
  const controller = useState(() => new AppController())[0];

  return (
    <div>
      <button onClick={action((e) => {controller.selected = null})}>Reset</button>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer >
          {controller.rectObjects.map((star) => (
            <RectElement key={star.id} rectObject={star} appController={controller} />
          ))}
          {controller.selectedRectObject && <AnchorsElement rectObject={controller.selectedRectObject} appController={controller} />}
        </Layer>
      </Stage>
    </div>
  );
});

export default App;
