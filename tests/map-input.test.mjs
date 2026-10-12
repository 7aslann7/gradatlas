import test from 'node:test';
import assert from 'node:assert/strict';
import {wheelIntent,gestureCamera} from '../src/map-input.js';

test('two-finger scrolling translates both axes without requesting a zoom change',()=>{
  assert.deepEqual(wheelIntent({deltaX:38,deltaY:-19,deltaMode:0,ctrlKey:false},3),{type:'pan',offset:[38,-19]});
  assert.deepEqual(wheelIntent({deltaX:0,deltaY:4,deltaMode:1,ctrlKey:false},3),{type:'pan',offset:[0,64]});
});
test('browser pinch zooms independently of trackpad translation and respects camera bounds',()=>{
  assert.deepEqual(wheelIntent({deltaX:80,deltaY:-25,deltaMode:0,ctrlKey:true},3),{type:'zoom',zoom:3.25});
  assert.equal(wheelIntent({deltaY:10000,deltaMode:0,ctrlKey:true},3).zoom,.4);
  assert.equal(wheelIntent({deltaY:-10000,deltaMode:0,ctrlKey:true},3).zoom,12);
});
test('Safari finger twists rotate geography in the same direction while preserving relative pinch zoom',()=>{
  assert.deepEqual(gestureCamera({zoom:2,bearing:15},{scale:2,rotation:30}),{zoom:3,bearing:-15});
  assert.deepEqual(gestureCamera({zoom:2,bearing:15},{scale:.5,rotation:-20}),{zoom:1,bearing:35});
  assert.deepEqual(gestureCamera({zoom:2,bearing:15},{scale:1,rotation:0}),{zoom:2,bearing:15});
});
test('both pinch paths can zoom out far enough for a full world on a portrait screen',()=>{
  const bounds={minZoom:-2,maxZoom:12};
  assert.equal(wheelIntent({deltaY:150,deltaMode:0,ctrlKey:true},.5,bounds).zoom,-1);
  assert.equal(gestureCamera({zoom:0,bearing:0},{scale:.5},bounds).zoom,-1);
});
