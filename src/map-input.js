// Trackpad scrolling is translation; browser pinch gestures arrive as Ctrl+wheel.
export function wheelIntent(event,zoom,{minZoom=.4,maxZoom=12}={}) {
  const unit=event.deltaMode===1?16:event.deltaMode===2?600:1;
  if(event.ctrlKey)return {type:'zoom',zoom:Math.max(minZoom,Math.min(maxZoom,zoom-event.deltaY*unit*.01))};
  return {type:'pan',offset:[event.deltaX*unit,event.deltaY*unit]};
}
export function gestureCamera(start,event,{minZoom=.4,maxZoom=12}={}) {
  // Safari reports a clockwise finger twist as positive; a positive map bearing
  // turns the visible geography counterclockwise, so invert that angle.
  return {zoom:Math.max(minZoom,Math.min(maxZoom,start.zoom+Math.log2(Math.max(.01,event.scale)))),bearing:start.bearing-(event.rotation||0)};
}
