# WebGL Boilerplate

There are plenty of other libraries out there which can do everything I need and more. But in an attempt to learn some of the intricacies of WebGL I decided to write my own mini-library to package up the core repetitive WebGL API calls. It mostly takes care of setting up the buffers for the geometries, setting up the attributes for the given shader program and also allows for "global" uniforms (uniforms applicable to all geometries for a particular program) and model specific uniforms to be updated seperately in an attempt to keep the draw loop efficient.

It is currently in a state where I can create shader programs and link them to relevent geometry. Below you can see 100,000 vertices on the unit sphere rendering without any sign of slowing down. There are minimal calculations going on but still, nice to know:

![100000 Points on a unit sphere](./images/100000points.gif)

And then a simple example showing two different shader programs being run concurrently:

![100000 Points on a unit sphere](./images/1000points.gif)

This is all part of some larger research which will hopefully result in some super responsive interactive particles systems, but we'll see..
