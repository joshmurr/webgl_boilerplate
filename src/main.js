import GL_BP from './GL_BP';
import * as Demo from './demos'

window.addEventListener("load", function(){
    const GL = new GL_BP();
    GL.init(512,512);

    Demo.userInteraction(GL)
    // Demo.particles3Dtexture(GL)
    // Demo.golTexture2d(GL)
    // Demo.particles3D(GL)
    // Demo.simpleParticles(GL)
    // Demo.fourOhfour(GL)
    // Demo.pointSphere(GL)
    // Demo.pointCube(GL)
    // Demo.icosahedron(GL)
});


