
export function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        r,g,b
    ];
}


function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

export function generateUID(){
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 15; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    localStorage.setItem('UID', text);
    return text;
}

export function createOverlay(){
    const container = document.createElement('div');
    container.classList.add("overlay");

    const text = document.createElement('P');
    text.innerHTML = `<h2>Getting to Know WebGL</h2>
                      <br>Generating icospheres and disturbing the vertices with Perlin noise.
                      <br><br>Mouse + WASD - Move
                      <br>Scroll - Change FOV`;
    container.appendChild(text);

    const code = document.createElement('a');
    code.text = "Code";
    code.href = "https://github.com/joshmurr/webgl_environment_test";

    container.appendChild(code);

    const body = document.getElementsByTagName("body")[0];
    body.appendChild(container);
}

export function detectBrowser(){
    // https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    if((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) return 'opera';
    else if(typeof InstallTrigger !== 'undefined') return 'firefox';
    else if(/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))) return 'safari';
    else if(/*@cc_on!@*/false || !!document.documentMode) return 'ie';
    else if(/* !isIE &&  */!!window.StyleMedia) return 'edge';
    else if(!!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)) return 'chrome';
    else if(navigator.userAgent.indexOf("Edg") != -1) return 'edgeChromium';
    else if(!!window.CSS) return 'blink';
}

export function mouseRay(_mousePos, _viewMat, _projMat){
    // -- MOUSE CLICK TO RAY PROJECTION: -----------------------
    const rayStart = vec4.fromValues(_mousePos[0], _mousePos[1], -1.0, 1.0);
    const rayEnd   = vec4.fromValues(_mousePos[0], _mousePos[1],  0.0, 1.0);

    const inverseMat = mat4.create();
    mat4.mul(inverseMat, _projMat, _viewMat);
    mat4.invert(inverseMat, inverseMat);

    const rayStart_world = getMultiplyVec(inverseMat, rayStart);
    vec4.scale(rayStart_world, rayStart_world, 1/rayStart_world[3]);
    const rayEnd_world =  getMultiplyVec(inverseMat, rayEnd);
    vec4.scale(rayEnd_world, rayEnd_world, 1/rayEnd_world[3]);

    const rayDir_world = vec4.create();
    vec4.subtract(rayDir_world, rayEnd_world, rayStart_world);

    // -- RAY INTERSECTION WITH UNIT SPHERE: -------------------
    const rayOrigin = vec3.fromValues(rayStart_world[0], rayStart_world[1], rayStart_world[2]);
    const rayDirection = vec3.fromValues(rayDir_world[0], rayDir_world[1], rayDir_world[2]);
    vec3.normalize(rayDirection, rayDirection);

    let a, b, c; // Floats
    let rayOrigin_sub_sphereOrigin = vec3.create();
    const sphereRadius = 0.5;

    a = vec3.dot(rayDirection, rayDirection);
    vec3.subtract(rayOrigin_sub_sphereOrigin, rayOrigin, vec3.fromValues(0,0,0));
    b = 2.0 * vec3.dot(rayDirection, rayOrigin_sub_sphereOrigin);
    c = vec3.dot(rayOrigin_sub_sphereOrigin, rayOrigin_sub_sphereOrigin);
    c -= (sphereRadius * sphereRadius);
    if (b*b - 4.0*a*c < 0.0) {
        return -1.0;
        // return [0, 0, 0, 0];
    }

    const distToIntersect = (-b - Math.sqrt((b*b) - 4.0*a*c))/(2.0*a);
    const intersect = vec3.create();

    vec3.scaleAndAdd(intersect, rayOrigin, rayDirection, distToIntersect);
    // Spread to convert from Float32Array to normal array
    // because socket.io struggles with F32 arrays.
    return [...intersect];
}

export function getMultiplyVec(mat, vec){
    let ret = new Float32Array(4);
    ret[0] = mat[0]*vec[0] + mat[4]*vec[1] + mat[8]*vec[2] + mat[12];
    ret[1] = mat[1]*vec[0] + mat[5]*vec[1] + mat[9]*vec[2] + mat[13];
    ret[2] = mat[2]*vec[0] + mat[6]*vec[1] + mat[10]*vec[2] + mat[14];
    ret[3] = mat[3]*vec[0] + mat[7]*vec[1] + mat[11]*vec[2] + mat[15];
    return ret;
}
