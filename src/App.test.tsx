// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import App from './App';

import { RectSpec, getAnchorPos, TOP_LEFT, Vector, BOTTOM_RIGHT, transformRectSpec, RIGHT, createRectSpec, LEFT, TOP, BOTTOM, getAnchorVec } from "./Calculation";

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });
export { }

/*

The following code works in a 2D coordinate system and y axis increases by north and x axis increases by east

*/

test('transformRectSpec', () => {
  let ans: RectSpec;

  expect(getAnchorPos({ x: 0, y: 0, width: 10, height: 10 }, TOP_LEFT)).toEqual(new Vector(-5, 5));
  expect(getAnchorPos({ x: 0, y: 0, width: 10, height: 10 }, BOTTOM_RIGHT)).toEqual(new Vector(5, -5));

  expect(getAnchorVec({ x: 0, y: 0, width: 10, height: 10 }, new Vector(-5, 5))).toEqual(TOP_LEFT);
  expect(getAnchorVec({ x: 0, y: 0, width: 10, height: 10 }, new Vector(5, -5))).toEqual(BOTTOM_RIGHT);

  ans = transformRectSpec({ x: 0, y: 0, width: 10, height: 10 }, BOTTOM_RIGHT, new Vector(6, 6));
  expect(ans).toEqual({ x: 0.5, y: 5.5, width: 11, height: 1 });

  ans = transformRectSpec({ x: 5, y: -5, width: 10, height: 10 }, BOTTOM_RIGHT, new Vector(6, 6));
  expect(ans).toEqual({ x: 3, y: 3, width: 6, height: 6 });

  ans = transformRectSpec({ x: 0, y: 0, width: 10, height: 7 }, RIGHT, new Vector(8, 0));
  expect(ans).toEqual({ x: 1.5, y: 0, width: 13, height: 7 });

  ans = transformRectSpec({ x: 0, y: 0, width: 10, height: 7 }, RIGHT, new Vector(8, 1));
  expect(ans).toEqual({ x: 1.5, y: 0, width: 13, height: 7 });

  ans = transformRectSpec(createRectSpec(-5, 5, 5, -5), BOTTOM_RIGHT, new Vector(6, 6));
  expect(ans).toEqual(createRectSpec(-5, 6, 6, 5));

  ans = transformRectSpec(createRectSpec(0, 0, 10, -10), BOTTOM_RIGHT, new Vector(6, 6));
  expect(ans).toEqual(createRectSpec(0, 6, 6, 0));

  ans = transformRectSpec(createRectSpec(-5 + 13, 3.5 + 13, 5 + 13, -3.5 + 13), RIGHT, new Vector(8 + 13, 0));
  expect(ans).toEqual(createRectSpec(-5 + 13, 3.5 + 13, 8 + 13, -3.5 + 13));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), RIGHT, new Vector(8, 0));
  expect(ans).toEqual(createRectSpec(-5, 3.5, 8, -3.5));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), RIGHT, new Vector(2, 0));
  expect(ans).toEqual(createRectSpec(-5, 3.5, 2, -3.5));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), RIGHT, new Vector(-6, 0));
  expect(ans).toEqual(createRectSpec(-6, 3.5, -5, -3.5));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), LEFT, new Vector(-8, 0));
  expect(ans).toEqual(createRectSpec(-8, 3.5, 5, -3.5));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), LEFT, new Vector(-2, 0));
  expect(ans).toEqual(createRectSpec(-2, 3.5, 5, -3.5));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), LEFT, new Vector(6, 0));
  expect(ans).toEqual(createRectSpec(5, 3.5, 6, -3.5));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), TOP, new Vector(0, 8));
  expect(ans).toEqual(createRectSpec(-5, 8, 5, -3.5));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), TOP, new Vector(0, 2));
  expect(ans).toEqual(createRectSpec(-5, 2, 5, -3.5));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), TOP, new Vector(0, -6));
  expect(ans).toEqual(createRectSpec(-5, -3.5, 5, -6));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), BOTTOM, new Vector(0, -8));
  expect(ans).toEqual(createRectSpec(-5, 3.5, 5, -8));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), BOTTOM, new Vector(0, -2));
  expect(ans).toEqual(createRectSpec(-5, 3.5, 5, -2));

  ans = transformRectSpec(createRectSpec(-5, 3.5, 5, -3.5), BOTTOM, new Vector(0, 6));
  expect(ans).toEqual(createRectSpec(-5, 6, 5, 3.5));
});
