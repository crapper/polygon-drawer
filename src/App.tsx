import { get } from 'http';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Star, Text, Rect, Circle } from 'react-konva';
import { action, computed, makeAutoObservable, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { JsxElement } from 'typescript';
import { RectSpec, getAnchorPos, TOP_LEFT, Vector, BOTTOM_RIGHT, transformRectSpec, RIGHT, createRectSpec, LEFT, TOP, BOTTOM, RectObject, ALL_ANCHORS, getAnchorVec, getAlignedAnchorPos } from "./Calculation";

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
  return [{ x, y, width: 50, height: 50, id: makeID(10), rotation: 45, isDragging: false }];
}

const INITIAL_STATE = generateShapes();


export const RectElement = observer(function (props: { rectObject: RectObject, appController: AppController }) {
  const { rectObject, appController } = props;

  const posInCanvas = fromCartesianToCanvas(new Vector(rectObject.x, rectObject.y));

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    //e.target.x Canvas
    let vec = new Vector(e.target.x(), e.target.y());//.add(new Vector(rectObject.width / 2, rectObject.height / 2)); // Canvas, make it become center again for the rectObject by add half of height and width
    vec = fromCanvasToCartesian(vec)
    rectObject.x = vec.x;
    rectObject.y = vec.y;
  }

  return <Rect
    id={rectObject.id}
    x={posInCanvas.x} // Canvas
    y={posInCanvas.y} // Canvas
    width={rectObject.width}
    height={rectObject.height}
    fill="#89b717"
    opacity={0.8}
    draggable
    rotation={rectObject.rotation}
    onClick={action((e) => { appController.selected = rectObject.id })}
    onDragMove={action(handleDragMove)}
    offsetX={rectObject.width / 2}
    offsetY={rectObject.height / 2}
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
  const { anchorVec: oldAnchorVec, rectObject, appController } = props;
  const oldAnchorPos = getAnchorPos(rectObject, oldAnchorVec); // Cartesian
  const oldAnchorPosInCanvas = fromCartesianToCanvas(oldAnchorPos); // Canvas
  return <Circle
    x={oldAnchorPosInCanvas.x}
    y={oldAnchorPosInCanvas.y}
    radius={5}
    fill="red"
    draggable
    onDragMove={action((e) => {
      const newAnchorPosInCanvas = new Vector(e.target.x(), e.target.y()); // Canvas
      const newAnchorPos = fromCanvasToCartesian(newAnchorPosInCanvas); // Cartesian
      const alignedNewAnchorPos = getAlignedAnchorPos(newAnchorPos, oldAnchorPos, oldAnchorVec);
      const newAnchorVec = getAnchorVec(rectObject, alignedNewAnchorPos);
      const newRectSpec = transformRectSpec(rectObject, newAnchorVec, newAnchorPos);
      rectObject.x = newRectSpec.x;
      rectObject.y = newRectSpec.y;
      rectObject.width = newRectSpec.width;
      rectObject.height = newRectSpec.height;
      
      const feedbackAnchorPos = getAnchorPos(rectObject, oldAnchorVec); // Cartesian
      const feedbackAnchorPosInCanvas = fromCartesianToCanvas(feedbackAnchorPos); // Canvas
      e.target.x(feedbackAnchorPosInCanvas.x);
      e.target.y(feedbackAnchorPosInCanvas.y);
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
