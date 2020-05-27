# WebGL Boilerplate

#### _This is all subject to change, but I generally don't write things up as often as I should so I'll leave this here for now, and update it eventually._

There are [plenty](https://github.com/greggman/twgl.js) of [other](https://github.com/skeeto/igloojs) [libraries](https://threejs.org/) out [there](https://github.com/yiwenl/Alfrid) which can do everything I need and more. But in an attempt to learn some of the intricacies of WebGL I decided to write my own mini-library to package up the core repetitive WebGL API calls (which so far has felt like the right decision, becuase I've learnt a lot about WebGL this way). 

`GL_BP` [working title] is developing into what feels like a flexible framework which packages up enough of the boring WebGL stuff (setting attributes and uniforms, creating textures, managing your shader programs and geometries etc.) while exposing enough of the WebGL settings to keep it felxible. I currently have a number of demos and more information [here][cci-vis-env] if you are interested.

Below you can see 100,000 vertices on the unit sphere rendering without any sign of slowing down. This little demo was inspired by Chris Wellons aka [Null Program](https://nullprogram.com/blog/2013/06/10/). There are minimal calculations going on but still, nice to know. (It's a GIF below but the actual demo is silky smooth. Silky.):

![100000 Points on a unit sphere](./images/100000points.gif)

Code for the above demo is as follows:

```javascript
import GL_BP from './GL_BP';

window.addEventListener("load", pointSphere());

function pointSphere() {
    // Using 'webpack-glsl-loader' to load from .glsl files
    const pointsVert = require('./glsl/pointsVert.glsl');
    const pointsFrag = require('./glsl/pointsFrag.glsl');
    const basicFrag = require('./glsl/basicFrag.glsl');

    const GL = new GL_BP();
    GL.init(512,512);

    GL.initShaderProgram('points', pointsVert, pointsFrag, null, 'POINTS');
    GL.initShaderProgram('lines', pointsVert, basicFrag, null, 'LINES');

    // Set options such as gl.enable('BLEND')
    // Here we tell GL *not* to clear so that both programs
    // are drawn to the screen.
    GL.setDrawParams('lines', { clear : null });

    // Create geometries with a shader program to link them
    const points = GL.RandomPointSphere(['points'], 100000);
    points.rotate = {s:0.001, a:[0,1,0]};

    const cube = GL.Cube(['lines'], 'DEBUG');
    cube.rotate = {s:0.001, a:[0,1,0]};

    // These are default geometry unfiforms;
    // initialize to send to shader program.
    GL.initProgramUniforms('points', [
        'u_ProjectionMatrix',
        'u_ViewMatrix',
    ]);
    GL.initGeometryUniforms('points', [ 'u_ModelMatrix' ]);

    // Repeat as it is a different shader program
    GL.initProgramUniforms('lines', [
        'u_ProjectionMatrix',
        'u_ViewMatrix',
    ]);
    GL.initGeometryUniforms('lines', [ 'u_ModelMatrix' ]);

    GL.cameraPosition = [0, 0, 3];

    function draw(now) {
        GL.draw(now);
        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
};
```

This is all part of some larger research which will hopefully result in some super responsive interactive particles systems. More information can be found on [the project website here][cci-vis-env].

[cci-vis-env]: https://joshmurr.github.io/cci-vis-env/
