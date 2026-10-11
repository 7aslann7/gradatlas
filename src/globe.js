import {loadGeography} from './geography.js';
export async function createGlobe(canvas,programmes) {
  let stopped=false,frame=0,last=0,rotation=-18;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),context=canvas.getContext('2d');
  if(!context)return {destroy(){}};
  const shapes=(await loadGeography()).map(region=>region.d.split('Z').map(ring=>{
    const numbers=ring.match(/-?\d+(?:\.\d+)?/g)?.map(Number)||[],points=[];
    for(let i=0;i<numbers.length;i+=2)points.push([(numbers[i]/1000*360-180)*Math.PI/180,(85-numbers[i+1]/510*150)*Math.PI/180]);
    return points;
  }));
  let size=0,dpr=1;
  function resize(){size=canvas.getBoundingClientRect().width||560;dpr=Math.min(2,devicePixelRatio||1);canvas.width=size*dpr;canvas.height=size*dpr;}
  function draw(time=0){
    if(stopped)return;const delta=last?Math.min(60,time-last):0;last=time;
    if(!reduced.matches&&!document.hidden)rotation+=delta*.0025;
    context.setTransform(dpr,0,0,dpr,0,0);context.clearRect(0,0,size,size);
    const radius=size*.415,mid=size/2,angle=rotation*Math.PI/180,tilt=.16;
    const point=([lon,lat])=>{const c=Math.cos(lat),x=c*Math.sin(lon+angle),rawY=Math.sin(lat),rawZ=c*Math.cos(lon+angle),y=rawY*Math.cos(tilt)-rawZ*Math.sin(tilt),z=rawY*Math.sin(tilt)+rawZ*Math.cos(tilt);return [mid+radius*x,mid-radius*y,z];};
    context.save();context.beginPath();context.arc(mid,mid,radius,0,Math.PI*2);context.clip();context.fillStyle='#f0f2e7';context.fillRect(0,0,size,size);context.fillStyle='#bacdb7';context.strokeStyle='#e6eddf';context.lineWidth=.6;
    for(const country of shapes)for(const ring of country){const visible=ring.map(point).filter(p=>p[2]>=0);if(visible.length<3)continue;context.beginPath();visible.forEach((p,i)=>i?context.lineTo(p[0],p[1]):context.moveTo(p[0],p[1]));context.closePath();context.fill();context.stroke();}
    context.strokeStyle='#77977035';context.lineWidth=.8;
    const line=points=>{context.beginPath();let active=false;for(const raw of points){const p=point(raw);if(p[2]<0){active=false;continue;}if(active)context.lineTo(p[0],p[1]);else context.moveTo(p[0],p[1]);active=true;}context.stroke();};
    for(let lat=-60;lat<=60;lat+=30){const points=[];for(let lon=-180;lon<=180;lon+=3)points.push([lon*Math.PI/180,lat*Math.PI/180]);line(points);}
    for(let lon=-180;lon<180;lon+=30){const points=[];for(let lat=-90;lat<=90;lat+=3)points.push([lon*Math.PI/180,lat*Math.PI/180]);line(points);}
    for(const p of programmes){const [x,y,z]=point([p.lon*Math.PI/180,p.lat*Math.PI/180]);if(z<=.1)continue;context.fillStyle='#145e4c20';context.beginPath();context.arc(x,y,7,0,Math.PI*2);context.fill();context.fillStyle='#245f4d';context.beginPath();context.arc(x,y,2.4,0,Math.PI*2);context.fill();}
    const light=context.createRadialGradient(mid-radius*.4,mid-radius*.4,radius*.1,mid,mid,radius);light.addColorStop(0,'#ffffff14');light.addColorStop(.75,'#233d2400');light.addColorStop(1,'#2442220c');context.fillStyle=light;context.fillRect(0,0,size,size);context.restore();context.strokeStyle='#92ae863a';context.lineWidth=1;context.beginPath();context.arc(mid,mid,radius,0,Math.PI*2);context.stroke();
    if(!reduced.matches)frame=requestAnimationFrame(draw);
  }
  function refresh(){resize();if(reduced.matches)draw();}
  resize();draw();window.addEventListener('resize',refresh);
  return {destroy(){stopped=true;cancelAnimationFrame(frame);window.removeEventListener('resize',refresh);}};
}
