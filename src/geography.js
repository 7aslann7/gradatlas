let geometry;
export function loadGeography() {
  return geometry ||= fetch('assets/world.json').then(response=>{
    if(!response.ok)throw Error('Geography unavailable');
    return response.json();
  }).catch(error=>{geometry=null;throw error;});
}
export const projectLocation = ({lon,lat}) => [(lon+180)/360*1000,(85-lat)/150*510];
