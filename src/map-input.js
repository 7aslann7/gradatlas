// Trackpad scrolling is translation; browser pinch gestures arrive as Ctrl+wheel.
export function wheelIntent(event,zoom) {
  const unit=event.deltaMode===1?16:event.deltaMode===2?600:1;
  if(event.ctrlKey)return {type:'zoom',zoom:Math.max(.4,Math.min(12,zoom-event.deltaY*unit*.01))};
  return {type:'pan',offset:[event.deltaX*unit,event.deltaY*unit]};
}
export function gestureCamera(start,event) {
  return {zoom:Math.max(.4,Math.min(12,start.zoom+Math.log2(Math.max(.01,event.scale)))),bearing:start.bearing+(event.rotation||0)};
}
